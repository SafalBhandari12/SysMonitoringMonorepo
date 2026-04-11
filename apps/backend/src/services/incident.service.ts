import prisma from "@repo/db/client";
import type {
  createIncidentSchema,
  updateIncidentSchema,
  getIncidentsFilterSchema,
} from "../schema/incident.schema.js";
import { NotFoundError } from "../lib/AppError.js";


class IncidentService {
  static async getAllIncidents(filters: getIncidentsFilterSchema) {
    const { status, apiId, startDate, endDate, page, limit } = filters;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (apiId) {
      where.apiId = apiId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        include: {
          api: {
            select: {
              id: true,
              name: true,
              path: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.incident.count({ where }),
    ]);

    return {
      data: incidents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getIncidentById(id: string) {
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        api: {
          select: {
            id: true,
            name: true,
            path: true,
            domain: {
              select: {
                domain: true,
              },
            },
          },
        },
      },
    });

    if (!incident) {
      throw new NotFoundError("Incident not found");
    }

    return incident;
  }

  static async createIncident(data: createIncidentSchema) {
    const { apiId } = data;

    // Verify API exists
    const api = await prisma.api.findUnique({
      where: { id: apiId },
    });

    if (!api) {
      throw new NotFoundError("API not found");
    }

    const incident = await prisma.incident.create({
      data: {
        apiId,
        title: `Incident on ${api.name}`,
        status: "ONGOING",
      },
      include: {
        api: {
          select: {
            id: true,
            name: true,
            path: true,
          },
        },
      },
    });

    return incident;
  }

  static async updateIncident(id: string, data: updateIncidentSchema) {
    // Verify incident exists
    const incident = await prisma.incident.findUnique({
      where: { id },
    });

    if (!incident) {
      throw new NotFoundError("Incident not found");
    }

    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: {
        ...(data.name && { title: data.name }),
        ...(data.description && { description: data.description }),
      },
      include: {
        api: {
          select: {
            id: true,
            name: true,
            path: true,
          },
        },
      },
    });

    return updatedIncident;
  }
}

export default IncidentService;
