import { Redis } from "ioredis";
import { ENV } from "../constants/env.js";

console.log(ENV.REDIS_URL);

const redis = new Redis(ENV.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});
redis.on("error", (err: any) => {
  console.error("Redis connection error:", err);
});

export default redis;
