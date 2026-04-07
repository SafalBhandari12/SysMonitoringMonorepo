import type { Request, Response } from "express";
import {
  apiGroupSchema,
  apiGroupIdSchema,
  paginationSchema,
} from "../schema/apiGroup.schema.js";
import ApiGroupService from "../services/apiGroup.service.js";

class ApiGroupController {
  static async createApiGroup(req: Request, res: Response) {
    console.log("Creating API Group with data:", req.body);
    const groupDetails = await apiGroupSchema.parseAsync(req.body);
    console.log("Parsed group details:", groupDetails);
    const userId = req.session.sessionId!;

    const response = await ApiGroupService.createApiGroup({
      groupDetails,
      userId,
    });

    return res.status(201).json({
      msg: "API Group created successfully",
      data: response,
    });
  }

  static async getAllApiGroups(req: Request, res: Response) {
    const userId = req.session.sessionId!;
    const { page, limit } = await paginationSchema.parseAsync(req.query);

    const response = await ApiGroupService.getAllApiGroups({
      userId,
      page,
      limit,
    });

    return res.json({
      msg: "API Groups fetched successfully",
      data: response.data,
      pagination: {
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
        hasMore: response.hasMore,
      },
    });
  }

  static async getSpecificApiGroup(req: Request, res: Response) {
    const { apiGroupId } = await apiGroupIdSchema.parseAsync(req.params);
    const userId = req.session.sessionId!;

    const response = await ApiGroupService.getSpecificApiGroup({
      apiGroupId,
      userId,
    });

    return res.json({
      msg: "API Group fetched successfully",
      data: response,
    });
  }
}

export default ApiGroupController;
