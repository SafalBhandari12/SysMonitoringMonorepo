import { app, InvocationContext, Timer } from "@azure/functions";
import { getPool, closePool } from "../utils/pool";
import pLimit from "p-limit";
import redis, { ensureRedisConnection } from "../utils/redis";
import {
  FAILURE_THRESHOLD,
  LOOKBACK_PERIOD,
  RECOVERY_THRESHOLD,
} from "../constants/incident";
import dotenv from "dotenv";
import type { PoolClient } from "pg";

dotenv.config();

function normalizeRegions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((region) => String(region).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .replace(/^\{/, "")
      .replace(/\}$/, "")
      .split(",")
      .map((region) => region.replace(/^"|"$/g, "").trim())
      .filter(Boolean);
  }

  return [];
}

interface ApiData {
  id: string;
  method: string;
  body: string | null;
  headers: string | null;
  path: string;
  pathParams: string | null;
  queryParams: string | null;
  domain: {
    domain: string;
  };
}

interface ResponseData {
  status: string;
  statusCode: number;
  responseTime: number;
}

async function getResponse(
  url: string,
  method: string,
  headers?: string,
  body?: string,
): Promise<ResponseData> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutMs = 15000; // 15 seconds

  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: headers ? JSON.parse(headers) : undefined,
      body: body ? JSON.stringify(body) : null,
      cache: "no-cache",
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        status: "UP",
        statusCode: response.status,
        responseTime,
      };
    } else {
      return {
        status: "DOWN",
        statusCode: response.status,
        responseTime,
      };
    }
  } catch (e: any) {
    clearTimeout(timeout);
    const responseTime = Date.now() - startTime;

    if (e.name === "AbortError") {
      return {
        status: "TIMEOUT",
        statusCode: 408,
        responseTime,
      };
    }

    return {
      status: "DOWN",
      statusCode: 0,
      responseTime,
    };
  }
}

async function processApi(
  client: PoolClient,
  redisClient: typeof redis,
  api: ApiData,
  region: string,
): Promise<void> {
  let responseData: ResponseData;

  try {
    const apiUrl =
      process.env.NODE_ENV === "development"
        ? `http://${api.domain.domain}${api.path}`
        : `https://${api.domain.domain}${api.path}`;

    responseData = await getResponse(apiUrl, api.method, api.headers, api.body);
  } catch (fetchErr: any) {
    console.error(`Error fetching API ${api.id}:`, fetchErr);
    return;
  }

  try {
    const key = `api_failures:${api.id}:${region}`;
    const now = Date.now();

    await client.query(
      `INSERT INTO "ApiResponse" (id, "apiId", status, "responseTime", "statusCode", region, "createdAt") 
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
      [
        api.id,
        responseData.status,
        responseData.responseTime,
        responseData.statusCode,
        region,
      ],
    );

    if (responseData.status !== "UP") {
      // Record failure in Redis - using camelCase methods
      await redisClient.zAdd(key, {
        score: now,
        value: `${api.id}-${region}:${now}`,
      });
      await redisClient.zRemRangeByScore(key, 0, now - LOOKBACK_PERIOD);
      const countResult = await redisClient.zCount(
        key,
        now - LOOKBACK_PERIOD,
        now,
      );
      const count =
        typeof countResult === "number" ? countResult : Number(countResult);

      if (count >= FAILURE_THRESHOLD) {
        const isThereIncident = await client.query(
          `SELECT id, regions FROM "Incident" 
           WHERE "apiId" = $1 AND status = 'ONGOING'
           LIMIT 1`,
          [api.id],
        );

        if (isThereIncident.rows.length === 0) {
          await client.query(
            `INSERT INTO "Incident" (id, "apiId", title, status, regions, "createdAt", "updatedAt") 
             VALUES (gen_random_uuid(), $1, $2, 'ONGOING', $3::"regions"[], NOW(), NOW())`,
            [api.id, `API Failure Detected - ${api.path}`, [region]],
          );
        } else {
          const incident = isThereIncident.rows[0];
          const existingRegions = normalizeRegions(incident.regions);
          console.log(
            `Existing regions for incident ${incident.id}:`,
            existingRegions,
          );
          if (!existingRegions.includes(region)) {
            const updatedRegions = [...existingRegions, region];
            await client.query(
              `UPDATE "Incident" SET regions = $1::"regions"[], "updatedAt" = NOW() 
               WHERE id = $2`,
              [updatedRegions, incident.id],
            );
          }
        }
      }
    } else {
      const countResult = await redisClient.zCount(
        key,
        now - LOOKBACK_PERIOD,
        now,
      );
      const count =
        typeof countResult === "number" ? countResult : Number(countResult);

      if (count < RECOVERY_THRESHOLD) {
        const lastIncident = await client.query(
          `SELECT id, status FROM "Incident" 
           WHERE "apiId" = $1 
           ORDER BY "createdAt" DESC 
           LIMIT 1`,
          [api.id],
        );

        if (
          lastIncident.rows.length > 0 &&
          lastIncident.rows[0].status === "ONGOING"
        ) {
          await client.query(
            `UPDATE "Incident" SET status = 'RESOLVED', "endTime" = NOW(), "updatedAt" = NOW() 
             WHERE id = $1`,
            [lastIncident.rows[0].id],
          );
        }
      }
    }

    console.log(`Processed API ${api.id}: ${responseData.status}`);
  } catch (dbErr: any) {
    console.error(`Error recording incident for API ${api.id}:`, dbErr);
    throw dbErr; // Propagate DB errors so they surface to main handler
  }
}

export async function hitAndStoreApi(
  myTimer: Timer,
  context: InvocationContext,
): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();
  const region = process.env.REGION || "IN";

  try {
    // Ensure Redis is connected before processing
    await ensureRedisConnection();

    const result = await client.query(
      `SELECT a.id, a.method, a.body, a.headers, a.path, a."pathParams", a."queryParams", 
              d.domain FROM "Api" a JOIN "Domain" d ON a."domainId" = d.id`,
    );

    const apis: ApiData[] = result.rows;
    context.log(`Found ${apis.length} APIs to process`);

    const limit = pLimit(20);

    await Promise.all(
      apis.map((api) => limit(() => processApi(client, redis, api, region))),
    );

    context.log(`Successfully processed ${apis.length} APIs`);
  } catch (err) {
    context.error("Error in hitAndStoreApi timer function:", err);
  } finally {
    client.release();
    await closePool(); // Ensure pool is closed after each invocation
    context.log("Timer function completed.");
  }
}

app.timer("hitAndStoreApi", {
  schedule: "0 */5 * * * *",
  handler: hitAndStoreApi,
});
