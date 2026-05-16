import postgres from 'postgres';
import { TDigest } from 'tdigest';

const API_METRICS_CRON = '*/15 * * * *';
const DAILY_STATS_CRON = '1 0 * * *';
const DNS_TXT_PREFIXES = ['monitoring-verify=', 'sysmonitoring-verification='];
const META_NAMES = ['sysMonitoring-Verification', 'sysmonitoring-verification'];

type Sql = ReturnType<typeof postgres>;

export interface Env {
	HYPERDRIVE: Hyperdrive;
}

type PendingDomain = {
	id: string;
	domain: string;
};

type ApiResponseRow = {
	apiId: string;
	region: string;
	status: string;
	responseTime: number;
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
	// Domain verification removed from worker. Keep stub for compatibility.
	return false;
}

async function verifyDomainWithMeta(domain: string, verificationCode: string): Promise<boolean> {
	// Domain verification removed from worker. Keep stub for compatibility.
	return false;
}

async function verifyDomain(domain: string, verificationCode: string): Promise<boolean> {
	return false;
}

async function runDomainVerification(sql: Sql): Promise<void> {
	console.log('Domain verification disabled; skipping.');
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

async function runApiMetricsAggregation(sql: Sql): Promise<void> {
	const now = new Date();
	const windowStart = new Date(now);
	windowStart.setUTCDate(windowStart.getUTCDate() - 90);

	console.log(`Processing API metrics from ${windowStart.toISOString()} to ${now.toISOString()}`);

	const responses = (await sql`
		SELECT "apiId", region, status, "responseTime"
		FROM "ApiResponse"
		WHERE "createdAt" >= ${windowStart} AND "createdAt" < ${now}
		ORDER BY "apiId", region, "createdAt"
	`) as ApiResponseRow[];

	if (responses.length === 0) {
		console.log('No API responses found for the current 90 day window');
		return;
	}

	// Load ApiDigest rows for the same 90-day window and merge into a TDigest per apiId
	const digests = await sql`
		SELECT "apiId", digest
		FROM "ApiDigest"
		WHERE "windowKey" >= ${windowStart.toISOString()} AND "windowKey" < ${now.toISOString()}
		ORDER BY "apiId", "windowKey"
	`;

	const globalDigestMap = new Map<string, TDigest>();

	for (const row of digests) {
		const apiId = row.apiId;
		let merged = globalDigestMap.get(apiId);
		if (!merged) merged = new TDigest();

		const digestData = row.digest as any;
		if (digestData && Array.isArray(digestData.centroids)) {
			for (const centroid of digestData.centroids) {
				merged.push(centroid.mean, centroid.count);
			}
		}

		globalDigestMap.set(apiId, merged);
	}

	const statsMap = new Map<
		string,
		{
			apiId: string;
			region: string;
			upCount: number;
			totalCount: number;
			totalResponseTime: number;
		}
	>();

	for (const row of responses) {
		const key = `${row.apiId}_${row.region}`;
		let existing = statsMap.get(key);

		if (!existing) {
			existing = {
				apiId: row.apiId,
				region: row.region,
				upCount: 0,
				totalCount: 0,
				totalResponseTime: 0,
			};
			statsMap.set(key, existing);
		}

		existing.totalCount += 1;
		existing.totalResponseTime += Number(row.responseTime);
		if (row.status === 'UP') {
			existing.upCount += 1;
		}
	}

	for (const stat of statsMap.values()) {
		const globalDigest = globalDigestMap.get(stat.apiId);
		const p90 = globalDigest ? globalDigest.percentile(0.9) : 0;
		const p99 = globalDigest ? globalDigest.percentile(0.99) : 0;
		const averageResponseTime = stat.totalCount > 0 ? stat.totalResponseTime / stat.totalCount : 0;

		await sql`
			INSERT INTO "ApiMetrics" (
				id,
				"apiId",
				region,
				"averageResponseTime",
				"p90ResponseTime",
				"p99ResponseTime",
				"upCount",
				"totalCount",
				"createdAt",
				"updatedAt"
			)
			VALUES (
				${crypto.randomUUID()},
				${stat.apiId},
				${stat.region},
				${averageResponseTime},
				${p90},
				${p99},
				${stat.upCount},
				${stat.totalCount},
				NOW(),
				NOW()
			)
			ON CONFLICT ("apiId", region) DO UPDATE SET
				"averageResponseTime" = ${averageResponseTime},
				"p90ResponseTime" = ${p90},
				"p99ResponseTime" = ${p99},
				"upCount" = ${stat.upCount},
				"totalCount" = ${stat.totalCount},
				"updatedAt" = NOW()
		`;

		console.log(
			`[API_METRICS] Upserted ${stat.apiId} / ${stat.region}: total=${stat.totalCount}, up=${stat.upCount}, p90=${p90}, p99=${p99}`,
		);
	}

	console.log('API metrics aggregation completed successfully');
}

export default {
	async fetch(req) {
		const url = new URL(req.url);
		url.pathname = '/__scheduled';
		url.searchParams.append('cron', API_METRICS_CRON);
		return new Response(
			`To test the scheduled handler, ensure you have used the "--test-scheduled" then try running "curl ${url.href}". Supported crons: ${API_METRICS_CRON}, ${DAILY_STATS_CRON}.`,
		);
	},

	async scheduled(event, env, ctx): Promise<void> {
		const sql = postgres(env.HYPERDRIVE.connectionString);

		try {
			if (event.cron === API_METRICS_CRON) {
				await runApiMetricsAggregation(sql);
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
