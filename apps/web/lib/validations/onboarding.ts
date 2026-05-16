import { z } from "zod";

export const onboardingSchema = z.object({
  organizationName: z
    .string()
    .min(3, { message: "Name must be at least 3 characters." })
    .max(50, { message: "Name cannot exceed 50 characters." }),
  organizationUrl: z
    .string()
    .min(3, { message: "URL slug must be at least 3 characters." })
    .max(50, { message: "URL slug cannot exceed 50 characters." })
    .regex(/^[a-z0-9-]+$/, {
      message: "URL slug can only contain lowercase letters, numbers, and hyphens.",
    }),
});
