import z from "zod";

function isValid5MinBucket(dateStr: string) {
  const d = new Date(dateStr);
  return (
    !isNaN(d.getTime()) &&
    d.getUTCSeconds() === 0 &&
    d.getUTCMilliseconds() === 0 &&
    d.getUTCMinutes() % 5 === 0
  );
}

export const TDigestSchema = z.object({
  apiId: z.string(),
  windowKey: z
    .string()
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: "Invalid ISO date",
    })
    .refine((val) => isValid5MinBucket(val), {
      message: "Must be a normalized 5-min UTC bucket",
    }),
  centroids: z
    .array(
      z.object({
        mean: z.number(),
        count: z.number().positive(),
      }),
    )
    .min(1)
    .max(160, { message: "Digest appears uncompressed: too many centroids" }),
  n: z.number().optional(),
});
