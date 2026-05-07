import { getUserId } from "@/lib/auth-utils";
import { prisma } from "@/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const jsonSchema: z.ZodType<Prisma.InputJsonValue | null> = z
  .json()
  .nullable();

const createApiSchema = z.object({
  name: z.string().trim().min(1),
  path: z.string().trim().min(1),
  method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  apiGroupId: z.string().trim().min(1),
  headers: jsonSchema,
  body: jsonSchema,
  pathParams: jsonSchema,
  queryParams: jsonSchema,
});

function toNullableJson(value: Prisma.InputJsonValue | null) {
  return value === null ? Prisma.JsonNull : value;
}

export async function GET() {
  try {
    const userId = await getUserId();
    const apis = await prisma.api.findMany({
      where: {
        domain: {
          userId,
        },
      },
      select: {
        id: true,
        name: true,
        method: true,
        path: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(apis);
  } catch (error) {
    console.error("Error fetching APIs:", error);

    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Failed to fetch APIs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const payload = createApiSchema.parse(await request.json());
    const domain = await prisma.domain.findFirst({
      where: {
        userId,
      },
    });

    if (!domain) {
      return NextResponse.json(
        { error: "No domain found for user" },
        { status: 404 },
      );
    }

    await prisma.api.create({
      data: {
        name: payload.name,
        path: payload.path,
        method: payload.method,
        domainId: domain.id,
        apiGroupId: payload.apiGroupId,
        headers: toNullableJson(payload.headers),
        body: toNullableJson(payload.body),
        pathParams: toNullableJson(payload.pathParams),
        queryParams: toNullableJson(payload.queryParams),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating API:", error);

    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ error: "Failed to create API" }, { status: 500 });
  }
}
