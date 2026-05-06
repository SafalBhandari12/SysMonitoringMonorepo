import { NextRequest, NextResponse } from "next/server";
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

    await prisma.apiDigest.create({
      data: {
        apiId,
        windowKey,
        digest: { centroids, n: parsed.data.n || 0 },
      },
    });

    return NextResponse.json({ message: "stored" });
  } catch (err: any) {
    if (err.code === "P2002") {
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
