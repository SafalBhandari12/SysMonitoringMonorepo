import type { NextFunction, Request, Response } from "express";
import { TDigest } from "tdigest";

declare const process: {
  env: Record<string, string | undefined>;
};

type MonitorOptions = {
  apiKey: string;
  endpoint?: string;
};

let initialized = false;
let started = false;
const digests = new Map<
  string,
  { requestUrl: string; windowKey: string; digest: TDigest }
>();
let config: { endpoint: string; apiKey: string; flushInterval: number } | null =
  null;

function ensureConfig(options?: MonitorOptions) {
  if (config) return config;

  const endpoint = options?.endpoint ?? process.env.SYS_MONITOR_ENDPOINT;
  const apiKey = options?.apiKey ?? process.env.SYS_MONITOR_API_KEY;

  if (!endpoint || !apiKey) {
    throw new Error(
      "SYS_MONITOR_ENDPOINT and apiKey or SYS_MONITOR_API_KEY must be set",
    );
  }

  try {
    new URL(endpoint);
  } catch {
    throw new Error(
      "SYS_MONITOR_ENDPOINT must be a valid absolute URL, for example http://localhost:3000/api/ping",
    );
  }

  config = { endpoint, apiKey, flushInterval: 5 * 60 * 1000 };
  return config;
}

export function initializeSysMonitoring(options?: MonitorOptions) {
  if (initialized) return;

  const cfg = ensureConfig(options);
  if (started) {
    initialized = true;
    return;
  }

  started = true;

  const interval = setInterval(() => {
    if (digests.size === 0) return;

    const fiveWindow = (ts: number) => {
      const d = new Date(ts);
      d.setUTCMinutes(Math.floor(d.getUTCMinutes() / 5) * 5, 0, 0);
      return d.toISOString().replace(".000Z", "Z");
    };
    const currentWindowKey = fiveWindow(Date.now());
    const flushable = Array.from(digests.values()).filter(
      (b) => b.windowKey < currentWindowKey,
    );
    if (flushable.length === 0) return;

    const fetchFn = (globalThis as any).fetch as typeof fetch | undefined;
    if (!fetchFn) return;

    for (const bucket of flushable) {
      // remove from map; we'll re-add if needed
      const key = `${bucket.requestUrl}\n${bucket.windowKey}`;
      digests.delete(key);

      bucket.digest.compress();
      const arr = bucket.digest.toArray();
      const centroids = arr.map((c) => ({ mean: c.mean, count: c.n }));
      const n = centroids.reduce((t, c) => t + c.count, 0);
      if (centroids.length === 0) continue;

      void fetchFn(cfg.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": cfg.apiKey,
        },
        body: JSON.stringify({
          requestUrl: bucket.requestUrl,
          windowKey: bucket.windowKey,
          centroids,
          n,
        }),
      })
        .then((response) => {
          const data = async () => {
            const data = await response.json();
            console.log("Response from monitoring endpoint:", data);
          };
          data();
          const ok =
            response && typeof response === "object"
              ? (response as any).ok
              : undefined;
          const status =
            response && typeof response === "object"
              ? (response as any).status
              : undefined;
          if (ok === false && status !== 409) {
            console.error(
              `Failed to flush digest for ${bucket.requestUrl} (${bucket.windowKey}): backend returned ${status ?? "non-ok response"}`,
            );
            digests.set(key, bucket);
            return;
          }
        })
        .catch((err) => {
          console.error(
            `Failed to flush digest for ${bucket.requestUrl} (${bucket.windowKey}):`,
            err,
          );
          digests.set(key, bucket);
        });
    }
  }, cfg.flushInterval);

  interval.unref?.();
  initialized = true;
}

export function createMonitorMiddleware(options: MonitorOptions) {
  initializeSysMonitoring(options);
  return monitorMiddleware;
}

export function monitorMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  initializeSysMonitoring();

  const start = Date.now();

  const forwardedProtocol = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const forwardedHost = req.get("x-forwarded-host")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol || req.protocol || "http";
  const host = forwardedHost || req.get("host");
  const path = req.originalUrl || req.url;

  if (!host) {
    throw new Error("Unable to determine request host for monitoring payload");
  }

  const requestUrl = `${protocol}://${host}${path}`;

  res.once("finish", () => {
    const duration = Date.now() - start;

    const timestamp = Date.now();
    const d = new Date(timestamp);
    d.setUTCMinutes(Math.floor(d.getUTCMinutes() / 5) * 5, 0, 0);
    const windowKey = d.toISOString().replace(".000Z", "Z");
    const digestKey = `${requestUrl}\n${windowKey}`;
    let bucket = digests.get(digestKey);
    if (!bucket) {
      bucket = { requestUrl, windowKey, digest: new TDigest() };
      digests.set(digestKey, bucket);
    }

    bucket.digest.push(duration);
  });

  next();
}
