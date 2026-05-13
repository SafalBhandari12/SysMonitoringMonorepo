import axios from "axios";
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

  const requestHeaderObject: Record<string, string> = {
    cookie: requestHeaders.get("cookie") ?? "",
  };

  if (init?.headers) {
    new Headers(init.headers).forEach((value, key) => {
      requestHeaderObject[key] = value;
    });
  }

  const response = await axios.request<T>({
    url: `${protocol}://${host}${path}`,
    method: init?.method as RequestInit["method"] | undefined,
    headers: requestHeaderObject,
    data: init?.body,
    validateStatus: () => true,
  });

  if (response.status < 200 || response.status >= 300) {
    const responseBody = response.data as
      | { error?: string; message?: string }
      | string
      | undefined;
    const message =
      typeof responseBody === "string"
        ? responseBody
        : (responseBody?.error ??
          responseBody?.message ??
          `Request to ${path} failed with ${response.status}`);

    throw new Error(message);
  }

  return response.data;
}
