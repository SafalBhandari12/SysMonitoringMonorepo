import { app, InvocationContext, Timer } from "@azure/functions";
import { getPool } from "../utils/pool";

export async function hitAndStoreApi(
  myTimer: Timer,
  context: InvocationContext,
): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const apis = await client.query(`SELECT * FROM "Api"`);
    console.log("APIs:", apis.rows);
  } catch (err) {
    console.error("Error connecting to the database", err);
  } finally {
    client.release();
  }
  context.log("Timer function processed request.");
}

app.timer("hitAndStoreApi", {
  schedule: "*/10 * * * * *",
  handler: hitAndStoreApi,
});
