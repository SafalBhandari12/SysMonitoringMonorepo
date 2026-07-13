import postgres from 'postgres';
import { TDigest } from 'tdigest';

const PING_CRON = '*/5 * * * *';
const API_METRICS_CRON = '*/15 * * * *';
const DAILY_STATS_CRON = '1 0 * * *';
const DNS_TXT_PREFIXES = ['monitoring-verify=', 'sysmonitoring-verification='];
const META_NAMES = ['sysMonitoring-Verification', 'sysmonitoring-verification'];

// Incident detection thresholds (ported from the old Azure hitApi function).
// Failures/recoveries are counted over a rolling LOOKBACK_PERIOD_MS window, tracked per
// api+region in D1 (see runPingSweep / recordFailure / countRecentFailures below) instead
// of the Redis sorted sets the Azure function used to rely on.
const FAILURE_THRESHOLD = 5;
// Fixed from the original Azure code, which set this to 20 (higher than FAILURE_THRESHOLD),
// so an ongoing incident could never actually drop back below it and auto-resolve.
const RECOVERY_THRESHOLD = 3;
const LOOKBACK_PERIOD_MS = 24 * 60 * 60 * 1000; // 24 hours
const PING_TIMEOUT_MS = 15000;
const PING_CONCURRENCY = 20;

type Sql = ReturnType<typeof postgres>;

export interface Env {
	HYPERDRIVE: Hyperdrive;
	DB: D1Database;
	REGION: string;
}

type ApiRow = {
	id: string;
	method: string;
	body: unknown;
	headers: unknown;
	pathParams: unknown;
	queryParams: unknown;
	name: string;
	targetUrl: string;
};

type PingResult = {
	status: 'UP' | 'DOWN' | 'TIMEOUT';
	statusCode: number;
	responseTime: number;
};

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

async function pingApi(api: ApiRow): Promise<PingResult> {
	const startTime = Date.now();
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

	try {
		const response = await fetch(api.targetUrl, {
			method: api.method,
			headers: (api.headers as HeadersInit | null) ?? undefined,
			body: api.body && api.method !== 'GET' ? JSON.stringify(api.body) : null,
			signal: controller.signal,
		});
		const responseTime = Date.now() - startTime;

		return {
			status: response.ok ? 'UP' : 'DOWN',
			statusCode: response.status,
			responseTime,
		};
	} catch (error: any) {
		const responseTime = Date.now() - startTime;

		if (error?.name === 'AbortError') {
			return { status: 'TIMEOUT', statusCode: 408, responseTime };
		}

		return { status: 'DOWN', statusCode: 0, responseTime };
	} finally {
		clearTimeout(timeout);
	}
}

// Simple bounded-concurrency runner so we don't open hundreds of simultaneous fetches on a
// large fleet; avoids pulling in a dependency (e.g. p-limit) just for this.
async function mapWithConcurrency<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
	let cursor = 0;

	async function worker() {
		while (cursor < items.length) {
			const item = items[cursor++];
			await fn(item);
		}
	}

	await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

function normalizeRegions(value: unknown): string[] {
	if (Array.isArray(value)) return value.map((region) => String(region));
	return [];
}

async function recordFailure(db: D1Database, apiId: string, region: string, now: number): Promise<number> {
	await db.prepare('INSERT INTO failure_events (api_id, region, created_at) VALUES (?, ?, ?)').bind(apiId, region, now).run();

	// Opportunistically prune this key's stale entries so the table doesn't grow unbounded.
	await db
		.prepare('DELETE FROM failure_events WHERE api_id = ? AND region = ? AND created_at < ?')
		.bind(apiId, region, now - LOOKBACK_PERIOD_MS)
		.run();

	return countRecentFailures(db, apiId, region, now);
}

async function countRecentFailures(db: D1Database, apiId: string, region: string, now: number): Promise<number> {
	const row = await db
		.prepare('SELECT COUNT(*) as count FROM failure_events WHERE api_id = ? AND region = ? AND created_at >= ?')
		.bind(apiId, region, now - LOOKBACK_PERIOD_MS)
		.first<{ count: number }>();

	return row?.count ?? 0;
}

async function processApi(sql: Sql, db: D1Database, api: ApiRow, region: string): Promise<void> {
	let result: PingResult;

	try {
		result = await pingApi(api);
	} catch (error) {
		console.error(`[PING] Error fetching API ${api.id}:`, error);
		return;
	}

	const now = Date.now();

	try {
		await sql`
			INSERT INTO "ApiResponse" (id, "apiId", status, "responseTime", "statusCode", region, "createdAt")
			VALUES (${crypto.randomUUID()}, ${api.id}, ${result.status}, ${result.responseTime}, ${result.statusCode}, ${region}, NOW())
		`;

		if (result.status !== 'UP') {
			const failureCount = await recordFailure(db, api.id, region, now);

			if (failureCount >= FAILURE_THRESHOLD) {
				const ongoing = await sql`
					SELECT id, regions FROM "Incident" WHERE "apiId" = ${api.id} AND status = 'ONGOING' LIMIT 1
				`;

				if (ongoing.length === 0) {
					await sql`
						INSERT INTO "Incident" (id, "apiId", title, status, regions, "createdAt", "updatedAt")
						VALUES (
							${crypto.randomUUID()},
							${api.id},
							${`API Failure Detected - ${api.targetUrl}`},
							'ONGOING',
							${sql.array([region])}::"regions"[],
							NOW(),
							NOW()
						)
					`;
				} else {
					const incident = ongoing[0];
					const existingRegions = normalizeRegions(incident.regions);

					if (!existingRegions.includes(region)) {
						const updatedRegions = [...existingRegions, region];
						await sql`
							UPDATE "Incident" SET regions = ${sql.array(updatedRegions)}::"regions"[], "updatedAt" = NOW()
							WHERE id = ${incident.id}
						`;
					}
				}
			}
		} else {
			const failureCount = await countRecentFailures(db, api.id, region, now);

			if (failureCount < RECOVERY_THRESHOLD) {
				const lastIncident = await sql`
					SELECT id, status FROM "Incident" WHERE "apiId" = ${api.id} ORDER BY "createdAt" DESC LIMIT 1
				`;

				if (lastIncident.length > 0 && lastIncident[0].status === 'ONGOING') {
					await sql`
						UPDATE "Incident" SET status = 'RESOLVED', "endTime" = NOW(), "updatedAt" = NOW()
						WHERE id = ${lastIncident[0].id}
					`;
				}
			}
		}

		console.log(`[PING] Processed API ${api.id}: ${result.status}`);
	} catch (dbErr) {
		console.error(`[PING] Error recording result for API ${api.id}:`, dbErr);
	}
}

async function runPingSweep(sql: Sql, db: D1Database, region: string): Promise<void> {
	const apis = (await sql`
		SELECT id, method, body, headers, "pathParams", "queryParams", "targetUrl", name FROM "Api"
	`) as unknown as ApiRow[];

	console.log(`[PING] Found ${apis.length} APIs to process (region=${region})`);

	await mapWithConcurrency(apis, PING_CONCURRENCY, (api) => processApi(sql, db, api, region));

	console.log('[PING] Sweep completed successfully');
}

export default {
	async fetch(req) {
		const url = new URL(req.url);
		url.pathname = '/__scheduled';
		url.searchParams.append('cron', PING_CRON);
		return new Response(
			`To test the scheduled handler, ensure you have used the "--test-scheduled" then try running "curl ${url.href}". Supported crons: ${PING_CRON}, ${API_METRICS_CRON}, ${DAILY_STATS_CRON}.`,
		);
	},

	async scheduled(event, env, ctx): Promise<void> {
		const sql = postgres(env.HYPERDRIVE.connectionString);

		try {
			if (event.cron === PING_CRON) {
				await runPingSweep(sql, env.DB, env.REGION || 'IN');
				return;
			}

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
