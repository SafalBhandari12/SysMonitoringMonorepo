import { apiStatusEnum, type methodEnum } from "@repo/db";

export const getResponse = async (
  url: string,
  method: methodEnum,
  headers?: any,
  body?: any,
) => {
  const startTime = Date.now();

  const controller = new AbortController();
  const timeoutMs = 180000; // 3 minutes
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method,
      headers: headers ? JSON.parse(headers) : undefined,
      body: body ? JSON.stringify(body) : null,
      cache: "no-cache",
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseTime = Date.now() - startTime;

    if (response.ok) {
      return {
        status: apiStatusEnum.UP,
        statusCode: response.status,
        responseTime,
      };
    } else {
      return {
        status: apiStatusEnum.DOWN,
        statusCode: response.status,
        responseTime,
      };
    }
  } catch (e: any) {
    clearTimeout(timeout);

    const responseTime = Date.now() - startTime;

    if (e.name === "AbortError") {
      return {
        status: apiStatusEnum.TIMEOUT,
        statusCode: 408,
        responseTime,
      };
    }

    return {
      status: apiStatusEnum.DOWN, // DNS failure, network error, etc.
      statusCode: 0,
      responseTime,
    };
  }
};
