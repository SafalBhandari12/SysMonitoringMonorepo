import { NextRequest, NextResponse } from "next/server";
import {
  cacheKey,
  deleteCachedPattern,
  getCached,
  setCached,
} from "@/lib/cache";
import { prisma } from "@/prisma";
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

    const userId = request.headers.get("x-authenticated-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Missing authenticated user ID" },
        { status: 401 },
      );
    }

    console.log(url, domain, path);

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

      await setCached(apiCacheKey, api, 3600);
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
