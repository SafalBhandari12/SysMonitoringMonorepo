import zod from "zod";

export const domainSchema = zod.object({
  domain: zod
    .string()
    .trim()
    .transform((value) => {
      try {
        // user pasted URL
        const url = new URL(
          value.startsWith("http") ? value : `https://${value}`,
        );
        return url.hostname.replace(/^www\./, "").toLowerCase();
      } catch {
        return value.toLowerCase();
      }
    })
    .refine(
      (value) => {
        const fqdnRegex =
          /^(?=.{1,253}$)(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/i;
        return fqdnRegex.test(value);
      },
      { message: "Invalid domain" },
    ),
});

export type domainSchema = zod.infer<typeof domainSchema>;

export const domainStatsRequestSchema = domainSchema;
