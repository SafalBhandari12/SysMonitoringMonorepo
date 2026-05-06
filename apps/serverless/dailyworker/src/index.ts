import postgres from 'postgres';
import { TDigest } from 'tdigest';

export interface Env {
	HYPERDRIVE: Hyperdrive;
}

export default {
	async fetch(req) {
		const url = new URL(req.url);
		url.pathname = '/__scheduled';
		url.searchParams.append('cron', '1 0 * * *');
		return new Response(`To test the scheduled handler, ensure you have used the "--test-scheduled" then try running "curl ${url.href}".`);
	},

	async scheduled(event, env, ctx): Promise<void> {
		try {
			const sql = postgres(env.HYPERDRIVE.connectionString);

			// Calculate yesterday's date range
			const now = new Date();
			const yesterday = new Date(now);
			yesterday.setUTCDate(yesterday.getUTCDate() - 1);
			yesterday.setUTCHours(0, 0, 0, 0);

			const yesterdayStart = yesterday;
			const yesterdayEnd = new Date(yesterday);
			yesterdayEnd.setUTCDate(yesterdayEnd.getUTCDate() + 1);

			console.log(`Processing data from ${yesterdayStart.toISOString()} to ${yesterdayEnd.toISOString()}`);

			// Step 1: Get all API responses from yesterday grouped by apiId and region
			const responses = await sql`
				SELECT "apiId", region, status, COUNT(*) as count
				FROM "ApiResponse"
				WHERE "createdAt" >= ${yesterdayStart} AND "createdAt" < ${yesterdayEnd}
				GROUP BY "apiId", region, status
			`;

			console.log(`Found ${responses.length} response groups`);

			// Process responses: group by apiId and region
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

			// Step 2: Create or update DailyStats with response counts
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
				// Upsert DailyStats with response data
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

			// Step 3: Get all ApiDigests from yesterday grouped by apiId
			const digests = await sql`
				SELECT "apiId", digest
				FROM "ApiDigest"
				WHERE "createdAt" >= ${yesterdayStart} AND "createdAt" < ${yesterdayEnd}
				ORDER BY "apiId", "windowKey"
			`;

			console.log(`Found ${digests.length} digests`);

			// Step 4: Process digests - aggregate by apiId and calculate p90/p99
			const digestMap = new Map<string, TDigest>();

			for (const row of digests) {
				const apiId = row.apiId;
				let digest = digestMap.get(apiId);

				if (!digest) {
					digest = new TDigest();
				}

				// Reconstruct TDigest from stored centroids
				const digestData = row.digest as any;
				if (digestData.centroids && Array.isArray(digestData.centroids)) {
					for (const centroid of digestData.centroids) {
						// Add samples to the digest
						for (let i = 0; i < centroid.count; i++) {
							digest.push(centroid.mean);
						}
					}
				}

				digestMap.set(apiId, digest);
			}

			// Step 5: Calculate p90 and p99 for each apiId and update DailyStats
			for (const [apiId, digest] of digestMap) {
				const p90 = digest.percentile(0.9);
				const p99 = digest.percentile(0.99);

				console.log(`API ${apiId}: p90=${p90}, p99=${p99}`);

				// Update all DailyStats entries for this apiId and yesterday's date
				await sql`
					UPDATE "DailyStats"
					SET "p90ResponseTime" = ${p90}, "p99ResponseTime" = ${p99}, "updatedAt" = NOW()
					WHERE "apiId" = ${apiId} AND date = ${yesterdayStart}
				`;
			}

			console.log('Daily stats aggregation completed successfully');
		} catch (error) {
			console.error('Error in scheduled handler:', error);
			throw error;
		}
	},
} satisfies ExportedHandler<Env>;
