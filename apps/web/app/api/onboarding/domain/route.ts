import { getUserId } from "@/lib/auth-utils";
import { cacheKey, deleteCached, getCached, setCached } from "@/lib/cache";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const registerDomainSchema = z.object({
  domain: z.string().trim().min(1),
});

export async function GET() {
  try {
    const userId = await getUserId();
    const key = cacheKey("onboarding", "domain", userId);
    const cached = await getCached<{ domain: unknown | null }>(key);

    if (cached !== null) {
      return NextResponse.json(cached.domain);
    }

    const domain = await prisma.domain.findFirst({
      where: {
        userId,
      },
    });

    await setCached(key, { domain }, 300);

    return NextResponse.json(domain);
  } catch (error) {
    console.error("Error fetching onboarding domain:", error);

    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch onboarding domain" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const { domain } = registerDomainSchema.parse(await request.json());

    await prisma.domain.create({
      data: {
        domain,
        userId,
      },
    });

    await deleteCached(cacheKey("onboarding", "domain", userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error registering onboarding domain:", error);

    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to register domain" },
      { status: 500 },
    );
  }
}
