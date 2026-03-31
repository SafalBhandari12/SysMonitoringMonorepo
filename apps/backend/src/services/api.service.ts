import prisma from "../utils/prisma.js";
import type { apiDetailsSchema } from "../schema/schema.js";
import { CONFLICT_ERROR, NotFoundError } from "../lib/AppError.js";
import type { plans } from "../generated/prisma/enums.js";
import REGIONS from "../constants/regions.js";
import getApiMonitoringQueue from "../queue/apiMonitoringQueue.js";

const apiCountPerPlan: Record<plans, number> = {
  FREE: 5,
  PROFESSIONAL: 20,
  ENTERPRISE: 100,
};

class ApiService {
  static async addApi(data: {
    domainId: string;
    apiDetails: apiDetailsSchema;
    userId: string;
  }) {
    const { domainId, apiDetails, userId } = data;
    const domainExists = await prisma.domain.findFirst({
      where: { id: domainId, userId },
    });
    if (!domainExists) {
      throw new NotFoundError("Domain not found");
    }
    const apiCount = await prisma.api.count({
      where: { domainId },
    });
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        userPlan: true,
      },
    });

    if (apiCount >= apiCountPerPlan[user!.userPlan]) {
      throw new CONFLICT_ERROR(
        `API limit reached for your plan. Please upgrade to add more APIs.`,
      );
    }

    const pathExists = await prisma.api.findFirst({
      where: {
        path: apiDetails.path,
        domainId,
        method: apiDetails.method,
      },
      select: {
        path: true,
        method: true,
      },
    });
    if (pathExists) {
      throw new CONFLICT_ERROR(
        `An API with path ${apiDetails.path} and method ${apiDetails.method} already exists for this domain`,
      );
    }
    const response = await prisma.api.create({
      data: {
        name: apiDetails.name,
        method: apiDetails.method,
        path: apiDetails.path,
        ...(apiDetails.headers && { headers: apiDetails.headers }),
        ...(apiDetails.body && { body: apiDetails.body }),
        ...(apiDetails.queryParams && { queryParams: apiDetails.queryParams }),
        ...(apiDetails.pathParams && { pathParams: apiDetails.pathParams }),
        domainId,
      },
      select: {
        id: true,
      },
    });
    for (const region of REGIONS) {
      const apiMonitoringQueue = getApiMonitoringQueue(region);
      await apiMonitoringQueue.add(
        "check-api",
        {
          apiId: response.id,
          region,
        },
        {
          repeat: { every: 1000, immediately: true },
          jobId: `api-${response.id}`,
        },
      );
    }
    return response;
  }
}

export default ApiService;
