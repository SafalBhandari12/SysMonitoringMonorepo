import { regions } from "@repo/db";
import dotenv from "dotenv";
dotenv.config();

const getRegion = (): regions => {
  const envRegion = process.env.REGION;
  if (envRegion && Object.values(regions).includes(envRegion as any)) {
    return envRegion as regions;
  }
  return regions.IN;
};

export const ENV = {
  REDIS_URL: process.env.REDIS_URL!,
  DATABASE_URL: process.env.DATABASE_URL!,
  REGION: getRegion(),
};
