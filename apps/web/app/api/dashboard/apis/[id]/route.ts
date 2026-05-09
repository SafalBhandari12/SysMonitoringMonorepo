import { getUserId } from "@/lib/auth-utils";
import { deleteCachedPattern } from "@/lib/cache";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await getUserId();
    const apiId = params.id;

    // Verify the API belongs to the user
    const api = await prisma.api.findUnique({
      where: { id: apiId },
      select: {
        id: true,
        apiGroup: {
          select: { userId: true },
        },
      },
    });

    if (!api) {
      return NextResponse.json({ error: "API not found" }, { status: 404 });
    }
    if (api.apiGroup === null) {
      return NextResponse.json({ error: "API group not found" });
    }

    if (api.apiGroup.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the API
    await prisma.api.delete({
      where: { id: apiId },
    });

    // Invalidate dashboard cache
    await deleteCachedPattern(`watchlayer:dashboard:overview:${userId}:*`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting API:", error);
    return NextResponse.json(
      { error: "Failed to delete API" },
      { status: 500 },
    );
  }
}
