import z from "zod";

export const createApiKeysSchema = z.object({
  name: z
    .string()
    .min(3, "Api Key name must be at least 3 characters.")
    .max(10, "Api Key name must be at most 10 characters.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Api Key name can only contain letters, numbers, and underscores.",
    ),
});
