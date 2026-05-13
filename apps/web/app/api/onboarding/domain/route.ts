import { getUserId } from "@/lib/auth-utils";
import {
  cacheKey,
  deleteCached,
  deleteCachedPattern,
  getCached,
  setCached,
} from "@/lib/cache";
import { prisma } from "@/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const registerDomainSchema = z.object({
  domain: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/,
      "Enter a valid domain without http:// or https://",
    ),
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

    const existingDomainForUser = await prisma.domain.findUnique({
      where: { userId },
      select: { id: true, domain: true, verificationStatus: true },
    });

    if (existingDomainForUser) {
      if (existingDomainForUser.verificationStatus === "VERIFIED") {
        return NextResponse.json(
          { error: "Verified domains cannot be changed." },
          { status: 409 },
        );
      }

      const existingDomain = await prisma.domain.findUnique({
        where: { domain },
        select: { id: true },
      });

      if (existingDomain && existingDomain.id !== existingDomainForUser.id) {
        return NextResponse.json(
          { error: "That domain is already registered." },
          { status: 409 },
        );
      }

      await prisma.domain.update({
        where: { id: existingDomainForUser.id },
        data: {
          domain,
          verificationStatus: "PENDING",
          lastVerificationAttempt: null,
          verificationAttempts: 0,
          verifiedAt: null,
        },
      });

      await prisma.user.update({
        where: { id: userId },
        data: { onboarded: false },
      });

      await Promise.all([
        deleteCached(cacheKey("onboarding", "domain", userId)),
        deleteCachedPattern(
          cacheKey("api", "by-url", existingDomainForUser.domain, "*"),
        ),
      ]);

      return NextResponse.json({ success: true });
    }

    const existingDomain = await prisma.domain.findUnique({
      where: { domain },
      select: { id: true },
    });

    if (existingDomain) {
      return NextResponse.json(
        { error: "That domain is already registered." },
        { status: 409 },
      );
    }

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

    const message =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
        ? "You have already registered a domain."
        : "Failed to register domain";

    return NextResponse.json({ error: message }, { status: 409 });
  }
}
