import { Redis } from "ioredis";
import { ENV } from "./env.js";

console.log(ENV.REDIS_URL);

const connection = new Redis(ENV.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

connection.on("connect", () => {
  console.log("Connected to Redis");
});
connection.on("error", (err: any) => {
  console.error("Redis connection error:", err);
});

export default connection;
