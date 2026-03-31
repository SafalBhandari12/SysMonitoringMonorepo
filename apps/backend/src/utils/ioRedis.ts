import { Redis } from "ioredis";
import { config } from "./config.js";

console.log(config.redisUrl);

const connection = new Redis(config.redisUrl, {
  maxRetriesPerRequest: null,
});

connection.on("connect", () => {
  console.log("Connected to Redis");
});
connection.on("error", (err: any) => {
  console.error("Redis connection error:", err);
});

export default connection;
