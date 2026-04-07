import type { apiGroupSchema } from "../schema/apiGroup.schema.js";
import { NotFoundError } from "../lib/AppError.js";
import prisma from "@repo/db/client";

class ApiGroupService {
  static async createApiGroup(data: {
    groupDetails: apiGroupSchema;
    userId: string;
  }) {
    const { groupDetails, userId } = data;

    const response = await prisma.apiGroup.create({
      data: {
        name: groupDetails.name,
        ...(groupDetails.description && {
          description: groupDetails.description,
        }),
        userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return response;
  }

  static async getAllApiGroups(data: {
    userId: string;
    page: number;
    limit: number;
  }) {
    const { userId, page, limit } = data;

    // Get total count
    const total = await prisma.apiGroup.count({
      where: { userId },
    });

    // Calculate pagination values
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    // Get paginated results
    const apiGroups = await prisma.apiGroup.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: {
            apis: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      data: apiGroups,
      page,
      limit,
      total,
      totalPages,
      hasMore,
    };
  }

  static async getSpecificApiGroup(data: {
    apiGroupId: string;
    userId: string;
  }) {
    const { apiGroupId, userId } = data;

    const apiGroup = await prisma.apiGroup.findFirst({
      where: { id: apiGroupId, userId },
      select: {
        id: true,
        name: true,
        description: true,
        apis: {
          select: {
            id: true,
            name: true,
            path: true,
            method: true,
            upTime: true,
          },
        },
        _count: {
          select: {
            apis: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!apiGroup) {
      throw new NotFoundError("API Group not found");
    }

    return apiGroup;
  }
}

export default ApiGroupService;
