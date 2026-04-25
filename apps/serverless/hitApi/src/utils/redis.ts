import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redis = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        console.error("Max reconnection attempts reached");
        return new Error("Max retries reached");
      }
      return retries * 100;
    },
  },
});

redis.on("error", (err) => {
  console.error("Redis Client Error", err);
});

redis.on("connect", () => {
  console.log("Redis client connected");
});

redis.on("ready", () => {
  console.log("Redis client ready");
});

// Ensure connection is established
async function ensureRedisConnection() {
  if (!redis.isOpen) {
    try {
      await redis.connect();
    } catch (err) {
      console.error("Failed to connect to Redis:", err);
      throw err;
    }
  }
}

// Auto-connect on module load
ensureRedisConnection().catch((err) => {
  console.error("Redis initialization error:", err);
});

export default redis;
export { ensureRedisConnection };
