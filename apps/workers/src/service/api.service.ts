import prisma from "@repo/db/client";
import { apiStatusEnum, methodEnum } from "@repo/db";
import { getResponse } from "./fetch.js";

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

    await prisma.$transaction(async (tx) => {
      if (data.status !== apiStatusEnum.UP) {
        const isThereIncident = await tx.incident.findFirst({
          where: { apiId, status: "ONGOING" },
        });
        if (!isThereIncident) {
          await tx.incident.create({
            data: {
              apiId,
              title: "",
              status: "ONGOING",
            },
          });
        }
      } else {
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
      await tx.apiResponse.create({
        data: {
          apiId,
          status: data.status,
          responseTime: data.responseTime,
          statusCode: data.statusCode,
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
    });
    return api;
  }
}
export default ApiService;
