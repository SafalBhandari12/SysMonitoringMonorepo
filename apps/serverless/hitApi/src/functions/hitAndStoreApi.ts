import { app, InvocationContext, Timer } from "@azure/functions";
import { getPool } from "../utils/pool";

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

const MAX_PARALLEL_REQUESTS = 20;

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
  client: any,
  api: ApiData,
  region: string,
): Promise<void> {
  try {
    const apiUrl =
      process.env.NODE_ENV === "development"
        ? `http://${api.domain.domain}${api.path}`
        : `https://${api.domain.domain}${api.path}`;

    const responseData = await getResponse(
      apiUrl,
      api.method,
      api.headers,
      api.body,
    );

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

    console.log(`Processed API ${api.id}: ${responseData.status}`);
  } catch (err) {
    console.error(`Error processing API ${api.id}:`, err);
  }
}

async function executeWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  maxConcurrency: number,
): Promise<void> {
  const executing: Promise<void>[] = [];

  for (const task of tasks) {
    const promise = Promise.resolve()
      .then(task)
      .then(() => {
        executing.splice(executing.indexOf(promise), 1);
      });

    executing.push(promise);

    if (executing.length >= maxConcurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
}

export async function hitAndStoreApi(
  myTimer: Timer,
  context: InvocationContext,
): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();
  const region = process.env.REGION || "unknown";

  try {
    // Fetch all APIs from database
    const result = await client.query(
      `SELECT a.id, a.method, a.body, a.headers, a.path, a."pathParams", a."queryParams", 
              d.domain FROM "Api" a JOIN "Domain" d ON a."domainId" = d.id`,
    );

    const apis: ApiData[] = result.rows;
    context.log(`Found ${apis.length} APIs to process`);

    // Create tasks for parallel processing
    const tasks = apis.map((api) => () => processApi(client, api, region));

    // Execute with concurrency limit (max 20 parallel requests)
    await executeWithConcurrency(tasks, MAX_PARALLEL_REQUESTS);

    context.log(`Successfully processed ${apis.length} APIs`);
  } catch (err) {
    context.error("Error in hitAndStoreApi timer function:", err);
  } finally {
    client.release();
    context.log("Timer function completed.");
  }
}

app.timer("hitAndStoreApi", {
  schedule: "0 */5 * * * *",
  handler: hitAndStoreApi,
});
