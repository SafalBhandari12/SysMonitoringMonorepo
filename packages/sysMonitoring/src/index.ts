import type { NextFunction, Request, Response } from "express";
import { TDigest } from "tdigest";

declare const process: {
  env: Record<string, string | undefined>;
};

type Config = {
  endpoint: string;
  apiKey: string;
  flushInterval: number;
};

type Centroid = {
  mean: number;
  count: number;
};

type DigestBucket = {
  requestUrl: string;
  windowKey: string;
  digest: TDigest;
};

type FetchLike = (
  input: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body: string;
  },
) => Promise<{ ok?: boolean; status?: number } | unknown>;

let cachedConfig: Config | null = null;
let initialized = false;
let started = false;
const digests = new Map<string, DigestBucket>();

function getConfig(): Config {
  if (cachedConfig) return cachedConfig;

  const endpoint = process.env.SYS_MONITOR_ENDPOINT;
  const apiKey = process.env.SYS_MONITOR_API_KEY;

  if (!endpoint || !apiKey) {
    throw new Error("SYS_MONITOR_ENDPOINT and SYS_MONITOR_API_KEY must be set");
  }

  cachedConfig = {
    endpoint,
    apiKey,
    flushInterval: 5 * 60 * 1000, // 5 minutes
  };

  return cachedConfig;
}

function getWindowKey(timestamp: number): string {
  const fiveMinutes = 5 * 60 * 1000;
  return new Date(Math.floor(timestamp / fiveMinutes) * fiveMinutes)
    .toISOString()
    .replace(".000Z", "Z");
}

function getDigestKey(requestUrl: string, windowKey: string): string {
  return `${requestUrl}\n${windowKey}`;
}

function pushDuration(
  duration: number,
  requestUrl: string,
  timestamp = Date.now(),
) {
  const windowKey = getWindowKey(timestamp);
  const digestKey = getDigestKey(requestUrl, windowKey);
  let bucket = digests.get(digestKey);

  if (!bucket) {
    bucket = {
      requestUrl,
      windowKey,
      digest: new TDigest(),
    };
    digests.set(digestKey, bucket);
  }

  bucket.digest.push(duration);
}

function getRequestUrl(req: Request): string {
  const forwardedProtocol = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = req.get("x-forwarded-host")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol || req.protocol || "http";
  const host = forwardedHost || req.get("host");
  const path = req.originalUrl || req.url;

  if (!host) {
    throw new Error("Unable to determine request host for monitoring payload");
  }

  return `${protocol}://${host}${path}`;
}

function serializeDigest(digest: TDigest) {
  digest.compress();

  const centroids: Centroid[] = digest.toArray().map((centroid) => ({
    mean: centroid.mean,
    count: centroid.n,
  }));
  const n = centroids.reduce((total, centroid) => total + centroid.count, 0);

  return { centroids, n };
}

function hasData(): boolean {
  return digests.size > 0;
}

function getFlushableEntries(timestamp = Date.now()): DigestBucket[] {
  const currentWindowKey = getWindowKey(timestamp);
  return Array.from(digests.values()).filter(
    (bucket) => bucket.windowKey < currentWindowKey,
  );
}

function isResponseLike(
  value: unknown,
): value is { ok?: boolean; status?: number } {
  return typeof value === "object" && value !== null;
}

function restoreDigest(bucket: DigestBucket) {
  const digestKey = getDigestKey(bucket.requestUrl, bucket.windowKey);
  const existing = digests.get(digestKey);

  if (!existing) {
    digests.set(digestKey, bucket);
    return;
  }

  for (const centroid of bucket.digest.toArray()) {
    existing.digest.push(centroid.mean, centroid.n);
  }
}

function startFlusher() {
  if (started) return;
  started = true;

  const config = getConfig();
  const interval = setInterval(() => {
    if (!hasData()) return;

    const fetchFn = (globalThis as { fetch?: FetchLike }).fetch;
    if (!fetchFn) return;

    for (const bucket of getFlushableEntries()) {
      digests.delete(getDigestKey(bucket.requestUrl, bucket.windowKey));

      const { centroids, n } = serializeDigest(bucket.digest);
      if (centroids.length === 0) continue;

      void fetchFn(config.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.apiKey,
        },
        body: JSON.stringify({
          requestUrl: bucket.requestUrl,
          windowKey: bucket.windowKey,
          centroids,
          n,
        }),
      })
        .then((response) => {
          if (
            isResponseLike(response) &&
            response.ok === false &&
            response.status !== 409
          ) {
            restoreDigest(bucket);
          }
        })
        .catch(() => {
          restoreDigest(bucket);
        });
    }
  }, config.flushInterval);

  interval.unref?.();
}

function initialize() {
  if (initialized) return;

  getConfig();
  startFlusher();
  initialized = true;
}

export function monitorMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  initialize();

  const start = Date.now();
  const requestUrl = getRequestUrl(req);

  res.once("finish", () => {
    pushDuration(Date.now() - start, requestUrl);
  });

  next();
}
