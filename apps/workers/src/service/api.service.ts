import prisma from "@repo/db/client";
import { apiStatusEnum, methodEnum } from "@repo/db";
import { getResponse } from "./fetch.js";
import redis from "../utils/redis.js";
import {
  FAILURE_THRESHOLD,
  LOOKBACK_PERIOD,
  RECOVERY_THRESHOLD,
} from "../constants/incident.js";
import { ENV } from "../constants/env.js";

class ApiService {
  static async fetchAndStore(apiId: string) {
    const api = await prisma.api.findUnique({
      where: { id: apiId },
      select: {
        method: true,
        body: true,
        headers: true,
        path: true,
        pathParams: true,
        queryParams: true,
        domain: {
          select: {
            domain: true,
          },
        },
      },
    });
    if (!api) {
      throw new Error("API not found");
    }
    const apiUrl =
      process.env.NODE_ENV === "development"
        ? `http://${api.domain.domain}${api.path}`
        : `https://${api.domain.domain}${api.path}`;
    const data = await getResponse(apiUrl, api.method);

    const key = `api_failures:${apiId}`;
    const now = Date.now();

    await prisma.$transaction(async (tx) => {
      if (data.status !== apiStatusEnum.UP) {
        await redis.zadd(key, now, `${apiId}-${ENV.REGION}:${now}`);
        await redis.zremrangebyscore(key, 0, now - LOOKBACK_PERIOD);
        const count = await redis.zcount(key, now - LOOKBACK_PERIOD, now);
        if (count >= FAILURE_THRESHOLD) {
          const isThereIncident = await tx.incident.findFirst({
            where: { apiId, status: "ONGOING" },
            select: { regions: true, id: true },
          });
          if (!isThereIncident) {
            await tx.incident.create({
              data: {
                apiId,
                title: `API Failure Detected - ${api.path}`,
                status: "ONGOING",
                regions: [ENV.REGION],
              },
            });
          }
          if (
            isThereIncident?.regions &&
            !isThereIncident.regions.includes(ENV.REGION)
          ) {
            await tx.incident.update({
              where: { id: isThereIncident.id },
              data: {
                regions: Array.from(
                  new Set([...isThereIncident.regions, ENV.REGION]),
                ),
              },
            });
          }
        }
      } else {
        const count = await redis.zcount(key, now - LOOKBACK_PERIOD, now);

        if (count < RECOVERY_THRESHOLD) {
          const lastIncident = await tx.incident.findFirst({
            where: { apiId },
            orderBy: { createdAt: "desc" },
          });
          if (lastIncident && lastIncident.status === "ONGOING") {
            await tx.incident.update({
              where: { id: lastIncident.id },
              data: { status: "RESOLVED" },
            });
          }
        }
      }
      await tx.apiResponse.create({
        data: {
          apiId,
          status: data.status,
          responseTime: data.responseTime,
          statusCode: data.statusCode,
          region: ENV.REGION,
        },
      });
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await tx.dailyStats.upsert({
        where: {
          apiId_date: {
            apiId,
            date: today,
          },
        },
        update: {
          totalCount: { increment: 1 },
          ...(data.status === apiStatusEnum.UP && {
            upCount: { increment: 1 },
          }),
        },
        create: {
          apiId,  
          totalCount: 1,
          ...(data.status === apiStatusEnum.UP && { upCount: 1 }),
          date: today,
        },
      });
      await tx.api.update({
        where: { id: apiId },
        data: {
          totalCounts: { increment: 1 },
          ...(data.status === apiStatusEnum.UP && {
            upCount: { increment: 1 },
          }),
        },
      });
    });
    return api;
  }
}
export default ApiService;
