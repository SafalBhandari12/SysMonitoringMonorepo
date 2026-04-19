import { getUserId } from "@/lib/auth-utils";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    const query = request.nextUrl.searchParams.get("q") || "";

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
      },
      take: 10,
    });

    return NextResponse.json(apiGroups);
  } catch (error) {
    console.error("Error fetching API groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch API groups" },
      { status: 500 },
    );
  }
}
