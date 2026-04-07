import zod from "zod";

export const pathSchema = zod
  .string()
  .regex(/^\/[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/, "Invalid path format");

export const uuidSchema = zod.object({ domainId: zod.uuid() });

export const apiDetailsSchema = zod.object({
  name: zod.string(),
  path: pathSchema,
  method: zod.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  headers: zod.record(zod.string(), zod.string()).optional(),
  body: zod.record(zod.string(), zod.string()).optional(),
  queryParams: zod.record(zod.string(), zod.string()).optional(),
  pathParams: zod.record(zod.string(), zod.string()).optional(),
  apiGroupId: zod.uuid().optional(),
});

export type apiDetailsSchema = zod.infer<typeof apiDetailsSchema>;
