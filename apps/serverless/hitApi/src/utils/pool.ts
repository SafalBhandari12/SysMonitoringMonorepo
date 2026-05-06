import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

let pool: Pool;

export function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      statement_timeout: 30000,
      query_timeout: 30000,
    });

    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
    });

    pool.on("connect", () => {
      console.log("New pool connection established");
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
