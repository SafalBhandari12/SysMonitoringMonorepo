import { getUserId } from "@/lib/auth-utils";
import { prisma } from "@/prisma";
import { createApiKeysSchema } from "@/schema/createApiKeys";
import { generateApiKey, hashKey } from "@/app/utils/hash";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const userId = await getUserId();
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error("Error fetching API keys:", error);

    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const { name } = createApiKeysSchema.parse(await request.json());
    const rawKey = generateApiKey();

    await prisma.apiKey.create({
      data: {
        name,
        userId,
        key: hashKey(rawKey),
      },
    });

    return NextResponse.json({ success: true, rawKey });
  } catch (error) {
    console.error("Error creating API key:", error);

    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 },
    );
  }
}
