import { headers } from "next/headers";

export async function fetchServerApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!host) {
    throw new Error("Unable to resolve request host");
  }

  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const response = await fetch(`${protocol}://${host}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      cookie: requestHeaders.get("cookie") ?? "",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `Request to ${path} failed with ${response.status}`;

    try {
      const body = (await response.json()) as {
        error?: string;
        message?: string;
      };
      message = body.error ?? body.message ?? message;
    } catch {
      // Keep the fallback status-based message when the response is not JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}
