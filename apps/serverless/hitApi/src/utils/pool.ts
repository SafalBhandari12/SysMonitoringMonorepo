import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

let pool: Pool;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5, // Lower for serverless
      idleTimeoutMillis: 10000, // Close idle connections faster
      connectionTimeoutMillis: 5000,
      statement_timeout: 30000, // 30s query timeout
      query_timeout: 30000,
    });

    // Handle connection errors
    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
    });
  }
  return pool;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined as any;
  }
}
