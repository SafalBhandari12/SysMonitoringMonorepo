import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  REDIS_URL: process.env.REDIS_URL!,
};
