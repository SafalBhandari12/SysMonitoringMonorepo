import postgres from 'postgres';
import { TDigest } from 'tdigest';

const DAILY_STATS_CRON = '1 0 * * *';
const DOMAIN_VERIFICATION_CRON = '*/30 * * * *';
const DNS_TXT_PREFIXES = ['monitoring-verify=', 'sysmonitoring-verification='];
const META_NAMES = ['sysMonitoring-Verification', 'sysmonitoring-verification'];

type Sql = ReturnType<typeof postgres>;

export interface Env {
	HYPERDRIVE: Hyperdrive;
}

type PendingDomain = {
	id: string;
	domain: string;
	verificationCode: string;
	verificationAttempts: number;
};

type DnsJsonResponse = {
	Answer?: Array<{
		data?: string;
	}>;
};

function normalizeTxtValue(value: string): string {
	return value.trim().replace(/^"|"$/g, '');
}

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function verifyDomainWithDns(domain: string, verificationCode: string): Promise<boolean> {
	try {
		const url = new URL('https://cloudflare-dns.com/dns-query');
		url.searchParams.set('name', domain);
		url.searchParams.set('type', 'TXT');

		const response = await fetch(url, {
			headers: {
				accept: 'application/dns-json',
			},
		});

		if (!response.ok) {
			return false;
		}

		const data = (await response.json()) as DnsJsonResponse;
		const expectedTokens = DNS_TXT_PREFIXES.map((prefix) => `${prefix}${verificationCode}`);

		return (data.Answer ?? []).some((record) => {
			if (!record.data) {
				return false;
			}

			const normalized = normalizeTxtValue(record.data);
			return expectedTokens.includes(normalized);
		});
	} catch (error) {
		console.error(`[DNS] Error verifying ${domain}:`, error);
		return false;
	}
}

async function verifyDomainWithMeta(domain: string, verificationCode: string): Promise<boolean> {
	try {
		const response = await fetch(`https://${domain}`, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
				Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
			},
			redirect: 'follow',
		});

		const html = await response.text();

		for (const name of META_NAMES) {
			const safeName = escapeRegExp(name);
			const contentFirst = new RegExp(`<meta\\b[^>]*content=["']([^"']+)["'][^>]*name=["']${safeName}["'][^>]*>`, 'i');
			const nameFirst = new RegExp(`<meta\\b[^>]*name=["']${safeName}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i');

			const contentFirstMatch = html.match(contentFirst);
			if (contentFirstMatch?.[1] === verificationCode) {
				return true;
			}

			const nameFirstMatch = html.match(nameFirst);
			if (nameFirstMatch?.[1] === verificationCode) {
				return true;
			}
		}

		return false;
	} catch (error) {
		console.error(`[META] Error verifying ${domain}:`, error);
		return false;
	}
}

async function verifyDomain(domain: string, verificationCode: string): Promise<boolean> {
	const [dnsResult, metaResult] = await Promise.all([
		verifyDomainWithDns(domain, verificationCode),
		verifyDomainWithMeta(domain, verificationCode),
	]);

	return dnsResult || metaResult;
}

async function runDomainVerification(sql: Sql): Promise<void> {
	const domains = (await sql`
		SELECT id, domain, "verificationCode", "verificationAttempts"
		FROM "Domain"
		WHERE "verificationStatus" = 'PENDING'
		ORDER BY "createdAt" ASC
	`) as PendingDomain[];

	if (domains.length === 0) {
		console.log('No pending domains found for verification');
		return;
	}

	console.log(`Found ${domains.length} pending domains to verify`);

	for (const domainRecord of domains) {
		console.log(`[DOMAIN] Verifying ${domainRecord.domain}`);
		const verified = await verifyDomain(domainRecord.domain, domainRecord.verificationCode);
		const now = new Date();

		if (verified) {
			await sql`
				UPDATE "Domain"
				SET "verificationStatus" = 'VERIFIED',
					"lastVerificationAttempt" = ${now},
					"verificationAttempts" = "verificationAttempts" + 1,
					"verifiedAt" = ${now},
					"updatedAt" = NOW()
				WHERE id = ${domainRecord.id}
			`;

			console.log(`[DOMAIN] Verified ${domainRecord.domain}`);
			continue;
		}

		await sql`
			UPDATE "Domain"
			SET "lastVerificationAttempt" = ${now},
				"verificationAttempts" = "verificationAttempts" + 1,
				"updatedAt" = NOW()
			WHERE id = ${domainRecord.id}
		`;

		console.log(`[DOMAIN] Still pending ${domainRecord.domain}`);
	}
}

async function runDailyStatsAggregation(sql: Sql): Promise<void> {
	const now = new Date();
	const yesterday = new Date(now);
	yesterday.setUTCDate(yesterday.getUTCDate() - 1);
	yesterday.setUTCHours(0, 0, 0, 0);

	const yesterdayStart = yesterday;
	const yesterdayEnd = new Date(yesterday);
	yesterdayEnd.setUTCDate(yesterdayEnd.getUTCDate() + 1);

	console.log(`Processing data from ${yesterdayStart.toISOString()} to ${yesterdayEnd.toISOString()}`);

	const responses = await sql`
		SELECT "apiId", region, status, COUNT(*) as count
		FROM "ApiResponse"
		WHERE "createdAt" >= ${yesterdayStart} AND "createdAt" < ${yesterdayEnd}
		GROUP BY "apiId", region, status
	`;

	console.log(`Found ${responses.length} response groups`);

	const statsMap = new Map<string, { upCount: number; totalCount: number }>();

	for (const row of responses) {
		const key = `${row.apiId}_${row.region}`;
		const existing = statsMap.get(key) || { upCount: 0, totalCount: 0 };

		existing.totalCount += Number(row.count);
		if (row.status === 'UP') {
			existing.upCount += Number(row.count);
		}

		statsMap.set(key, existing);
	}

	const dailyStatsInserts = [];
	for (const [key, counts] of statsMap) {
		const [apiId, region] = key.split('_');
		dailyStatsInserts.push({
			apiId,
			region,
			date: yesterdayStart,
			...counts,
		});
	}

	if (dailyStatsInserts.length > 0) {
		for (const stat of dailyStatsInserts) {
			await sql`
				INSERT INTO "DailyStats" (id, "apiId", date, region, "upCount", "totalCount", "p90ResponseTime", "p99ResponseTime", "createdAt", "updatedAt")
				VALUES (
					${crypto.randomUUID()},
					${stat.apiId},
					${stat.date},
					${stat.region},
					${stat.upCount},
					${stat.totalCount},
					0,
					0,
					 NOW(),
					NOW()
				)
				ON CONFLICT ("apiId", date, region) DO UPDATE SET
					"upCount" = ${stat.upCount},
					"totalCount" = ${stat.totalCount},
					"updatedAt" = NOW()
			`;
		}
	}

	const digests = await sql`
		SELECT "apiId", digest
		FROM "ApiDigest"
		WHERE "createdAt" >= ${yesterdayStart} AND "createdAt" < ${yesterdayEnd}
		ORDER BY "apiId", "windowKey"
	`;

	console.log(`Found ${digests.length} digests`);

	const digestMap = new Map<string, TDigest>();

	for (const row of digests) {
		const apiId = row.apiId;
		let digest = digestMap.get(apiId);

		if (!digest) {
			digest = new TDigest();
		}

		const digestData = row.digest as any;
		if (digestData.centroids && Array.isArray(digestData.centroids)) {
			for (const centroid of digestData.centroids) {
				for (let i = 0; i < centroid.count; i++) {
					digest.push(centroid.mean);
				}
			}
		}

		digestMap.set(apiId, digest);
	}

	for (const [apiId, digest] of digestMap) {
		const p90 = digest.percentile(0.9);
		const p99 = digest.percentile(0.99);

		console.log(`API ${apiId}: p90=${p90}, p99=${p99}`);

		await sql`
			UPDATE "DailyStats"
			SET "p90ResponseTime" = ${p90}, "p99ResponseTime" = ${p99}, "updatedAt" = NOW()
			WHERE "apiId" = ${apiId} AND date = ${yesterdayStart}
		`;
	}

	console.log('Daily stats aggregation completed successfully');
}

export default {
	async fetch(req) {
		const url = new URL(req.url);
		url.pathname = '/__scheduled';
		url.searchParams.append('cron', DOMAIN_VERIFICATION_CRON);
		return new Response(
			`To test the scheduled handler, ensure you have used the "--test-scheduled" then try running "curl ${url.href}". Supported crons: ${DOMAIN_VERIFICATION_CRON}, ${DAILY_STATS_CRON}.`,
		);
	},

	async scheduled(event, env, ctx): Promise<void> {
		const sql = postgres(env.HYPERDRIVE.connectionString);

		try {
			if (event.cron === DOMAIN_VERIFICATION_CRON) {
				await runDomainVerification(sql);
				return;
			}

			if (event.cron === DAILY_STATS_CRON) {
				await runDailyStatsAggregation(sql);
				return;
			}

			console.log(`Unhandled cron schedule: ${event.cron}`);
		} catch (error) {
			console.error('Error in scheduled handler:', error);
			throw error;
		}
	},
} satisfies ExportedHandler<Env>;
