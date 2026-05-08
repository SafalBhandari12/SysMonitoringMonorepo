import { NextRequest, NextResponse } from "next/server";
import {
  cacheKey,
  deleteCachedPattern,
  getCached,
  setCached,
} from "@/lib/cache";
import { prisma } from "@/prisma";
import { TDigestSchema } from "@/schema/pingApi.schema";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = TDigestSchema.safeParse(json);
    if (!parsed.success) {
      console.error("Invalid TDigest data:", parsed.error);
      return NextResponse.json(
        { error: "Invalid TDigest data" },
        { status: 400 },
      );
    }

    const { apiId, windowKey, centroids } = parsed.data;
    const apiOwnerCacheKey = cacheKey("api", "owner", apiId);
    let apiOwner = await getCached<{ userId: string }>(apiOwnerCacheKey);

    if (!apiOwner) {
      const api = await prisma.api.findUnique({
        where: {
          id: apiId,
        },
        select: {
          apiGroup: {
            select: {
              userId: true,
            },
          },
        },
      });

      apiOwner = api?.apiGroup?.userId ? { userId: api.apiGroup.userId } : null;

      if (apiOwner) {
        await setCached(apiOwnerCacheKey, apiOwner, 3600);
      }
    }

    await prisma.apiDigest.create({
      data: {
        apiId,
        windowKey,
        digest: { centroids, n: parsed.data.n || 0 },
      },
    });

    if (apiOwner) {
      await deleteCachedPattern(
        cacheKey("dashboard", "overview", apiOwner.userId, "*"),
      );
    }

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
