import { NextRequest, NextResponse } from "next/server";
import {
  cacheKey,
  deleteCachedPattern,
  getCached,
  setCached,
} from "@/lib/cache";
import { prisma } from "@/prisma";
import { hashKey } from "@/app/utils/hash";
import { TDigestSchema } from "@/schema/pingApi.schema";

function domainCandidate(url: URL): string {
  return url.hostname.toLowerCase();
}

function apiPathCandidate(pathname: string): string {
  return pathname || "/";
}

export async function POST(request: NextRequest) {
  try {
    console.log("Received ping request");
    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { success: false, message: "API key missing" },
        { status: 401 },
      );
    }

    const json = await request.json();
    const parsed = TDigestSchema.safeParse(json);
    if (!parsed.success) {
      console.error("Invalid TDigest data:", parsed.error);
      return NextResponse.json(
        { error: "Invalid TDigest data" },
        { status: 400 },
      );
    }

    const { requestUrl, windowKey, centroids } = parsed.data;
    const url = new URL(requestUrl);
    const domain = domainCandidate(url);
    const path = apiPathCandidate(url.pathname);
    const apiCacheKey = cacheKey("api", "by-url", domain, path);
    let api = await getCached<{ id: string; userId: string }>(apiCacheKey);

    const hashedKey = hashKey(apiKey);
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: {
        key: hashedKey,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!apiKeyRecord) {
      return NextResponse.json(
        { success: false, message: "Invalid API key" },
        { status: 401 },
      );
    }

    const userId = apiKeyRecord.userId;

    if (!api) {
      const apiRecord = await prisma.api.findFirst({
        where: {
          domain: {
            domain,
            userId,
          },
          path,
        },
        select: {
          id: true,
        },
      });
      if (!apiRecord) {
        return NextResponse.json(
          { error: "API not found for request URL" },
          { status: 404 },
        );
      }

      api = { id: apiRecord?.id, userId: userId };

      void setCached(apiCacheKey, api, 3600);
    }

    await prisma.apiDigest.create({
      data: {
        apiId: api.id,
        windowKey,
        digest: { centroids, n: parsed.data.n || 0 },
      },
    });

    await deleteCachedPattern(
      cacheKey("dashboard", "overview", api.userId, "*"),
    );

    return NextResponse.json({ message: "stored" });
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      err.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Window already exists (duplicate submission)" },
        { status: 409 },
      );
    }

    console.error("Error processing ping request:", err);
    return NextResponse.json(
      { error: "Failed to process ping" },
      { status: 500 },
    );
  }
}
