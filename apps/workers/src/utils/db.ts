import PG from "pg";
import { ENV } from "./env.js";

const { Pool } = PG;

export const pool = new Pool({ connectionString: ENV.DATABASE_URL });
pool.on("connect", () => {
  console.log("Connected to the database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});
