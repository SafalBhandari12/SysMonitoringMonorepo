import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const rateLimitResponse = ({
  limit,
  remaining,
  reset,
}: {
  limit: number;
  remaining: number;
  reset: number;
}) =>
  NextResponse.json(
    { error: "Too many requests" },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(reset),
      },
    },
  );

export const createRateLimit = (
  prefix: string,
  limit: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1],
) =>
  new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: true,
    prefix,
  });

export const enforceRateLimit = async (
  rateLimit: Ratelimit,
  identifier: string,
) => {
  const { success, limit, remaining, reset } =
    await rateLimit.limit(identifier);

  if (!success) {
    return rateLimitResponse({ limit, remaining, reset });
  }

  return null;
};
