import { getUserId } from "@/lib/auth-utils";
import {
  cacheKey,
  deleteCachedPattern,
  getCached,
  setCached,
} from "@/lib/cache";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createApiGroupSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    const query = request.nextUrl.searchParams.get("q") || "";
    const key = cacheKey("dashboard", "api-groups", userId, query || "all");
    const cached = await getCached(key);

    if (cached) {
      return NextResponse.json(cached);
    }

    const apiGroups = await prisma.apiGroup.findMany({
      where: {
        userId,
        ...(query && {
          name: {
            contains: query,
            mode: "insensitive",
          },
        }),
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
      take: query ? 10 : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });

    void setCached(key, apiGroups, query ? 30 : 300);

    return NextResponse.json(apiGroups);
  } catch (error) {
    console.error("Error fetching API groups:", error);

    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch API groups" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = createApiGroupSchema.parse(await request.json());

    await prisma.apiGroup.create({
      data: {
        name: body.name,
        description: body.description,
        userId,
      },
    });

    await Promise.all([
      deleteCachedPattern(cacheKey("dashboard", "api-groups", userId, "*")),
      deleteCachedPattern(cacheKey("dashboard", "overview", userId, "*")),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating API group:", error);

    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create API group" },
      { status: 500 },
    );
  }
}
