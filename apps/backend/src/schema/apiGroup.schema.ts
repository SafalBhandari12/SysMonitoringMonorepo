import zod from "zod";

export const apiGroupSchema = zod.object({
  name: zod.string().min(1, "Name is required"),
  description: zod.string().optional(),
});

export const apiGroupIdSchema = zod.object({ apiGroupId: zod.uuid() });

export const paginationSchema = zod.object({
  page: zod
    .union([zod.string(), zod.number()])
    .transform((val) => parseInt(String(val), 10))
    .refine((val) => !isNaN(val), "Page must be a valid number")
    .refine((val) => val >= 1, "Page must be at least 1")
    .optional()
    .default(1),
  limit: zod
    .union([zod.string(), zod.number()])
    .transform((val) => parseInt(String(val), 10))
    .refine((val) => !isNaN(val), "Limit must be a valid number")
    .refine((val) => val >= 1, "Limit must be at least 1")
    .refine((val) => val <= 100, "Limit cannot exceed 100")
    .optional()
    .default(10),
});

export type apiGroupSchema = zod.infer<typeof apiGroupSchema>;
export type paginationSchema = zod.infer<typeof paginationSchema>;
