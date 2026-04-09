import type { Request, Response } from "express";
import {
  incidentIdSchema,
  createIncidentSchema,
  updateIncidentSchema,
  getIncidentsFilterSchema,
} from "../schema/incident.schema.js";
import IncidentService from "../services/incident.service.js";

class IncidentController {
  static async getAllIncidents(req: Request, res: Response) {
    const filters = await getIncidentsFilterSchema.parseAsync(req.query);
    const result = await IncidentService.getAllIncidents(filters);
    return res.json({
      msg: "Incidents retrieved successfully",
      ...result,
    });
  }

  static async getIncidentById(req: Request, res: Response) {
    const { id } = await incidentIdSchema.parseAsync(req.params);
    const incident = await IncidentService.getIncidentById(id);
    return res.json({
      msg: "Incident retrieved successfully",
      data: incident,
    });
  }

  static async createIncident(req: Request, res: Response) {
    const incidentData = await createIncidentSchema.parseAsync(req.body);
    const incident = await IncidentService.createIncident(incidentData);
    return res.status(201).json({
      msg: "Incident created successfully",
      data: incident,
    });
  }

  static async updateIncident(req: Request, res: Response) {
    const { id } = await incidentIdSchema.parseAsync(req.params);
    const updateData = await updateIncidentSchema.parseAsync(req.body);
    const incident = await IncidentService.updateIncident(id, updateData);
    return res.json({
      msg: "Incident updated successfully",
      data: incident,
    });
  }
}

export default IncidentController;
