import zod from "zod";

export const incidentIdSchema = zod.object({ id: zod.uuid() });

export const createIncidentSchema = zod.object({
  apiId: zod.uuid(),
});

export type createIncidentSchema = zod.infer<typeof createIncidentSchema>;

export const updateIncidentSchema = zod.object({
  name: zod.string().optional(),
  description: zod.string().optional(),
});

export type updateIncidentSchema = zod.infer<typeof updateIncidentSchema>;

export const getIncidentsFilterSchema = zod.object({
  status: zod.enum(["ONGOING", "RESOLVED"]).optional(),
  apiId: zod.string().uuid().optional(),
  startDate: zod.string().datetime().optional(),
  endDate: zod.string().datetime().optional(),
  page: zod.number().int().positive().optional().default(1),
  limit: zod.number().int().positive().max(100).optional().default(10),
});

export type getIncidentsFilterSchema = zod.infer<
  typeof getIncidentsFilterSchema
>;
