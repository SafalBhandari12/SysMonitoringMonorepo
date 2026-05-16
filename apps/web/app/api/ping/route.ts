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

function fullUrlCandidate(url: URL): string {
  return url.toString();
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
    const fullUrl = fullUrlCandidate(url);
    const apiCacheKey = cacheKey("api", "by-url", fullUrl);
    let api = await getCached<{ id: string; apiGroupUserId: string }>(apiCacheKey);

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
        where: { targetUrl: fullUrl },
        select: {
          id: true,
          apiGroup: { select: { userId: true } },
        },
      });
      if (!apiRecord) {
        return NextResponse.json(
          { error: "API not found for request URL" },
          { status: 404 },
        );
      }

      // Verify API belongs to the user making the request
      if (apiRecord.apiGroup.userId !== userId) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 },
        );
      }

      api = { id: apiRecord.id, apiGroupUserId: apiRecord.apiGroup.userId };

      void setCached(apiCacheKey, api, 3600);
    }

    // Verify API still belongs to the user (in case cached)
    if (api.apiGroupUserId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 },
      );
    }

    await prisma.apiDigest.create({
      data: {
        apiId: api.id,
        windowKey,
        digest: { centroids, n: parsed.data.n || 0 },
      },
    });

    await deleteCachedPattern(
      cacheKey("dashboard", "overview", api.apiGroupUserId, "*"),
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
