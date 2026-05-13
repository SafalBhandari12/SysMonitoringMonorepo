import { getUserId } from "@/lib/auth-utils";
import { cacheKey, deleteCached, getCached, setCached } from "@/lib/cache";
import verifyDomain from "@/lib/onboarding/verifyDomain";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const userId = await getUserId();
    const domainCacheKey = cacheKey("onboarding", "domain", userId);
    const cachedDomain =
      await getCached<{ domain: Awaited<ReturnType<typeof prisma.domain.findFirst>> }>(
        domainCacheKey,
      );
    const domainRecord =
      cachedDomain !== null
        ? cachedDomain.domain
        : await prisma.domain.findFirst({
            where: {
              userId,
            },
          });

    if (cachedDomain === null) {
      await setCached(domainCacheKey, { domain: domainRecord }, 300);
    }

    if (!domainRecord) {
      return NextResponse.json({ success: false, verified: false });
    }

    const isVerified = await verifyDomain(
      domainRecord.domain,
      domainRecord.verificationCode,
      "BOTH",
    );

    await prisma.domain.update({
      where: { id: domainRecord.id },
      data: {
        lastVerificationAttempt: new Date(),
        verificationAttempts: { increment: 1 },
      },
    });

    if (!isVerified) {
      await deleteCached(domainCacheKey);
      return NextResponse.json({ success: true, verified: false });
    }

    await prisma.domain.update({
      where: {
        id: domainRecord.id,
      },
      data: {
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: {
        onboarded: true,
      },
    });
    await deleteCached(domainCacheKey);

    return NextResponse.json({ success: true, verified: true });
  } catch (error) {
    console.error("Error verifying domain:", error);

    if (error instanceof Error && error.message === "User not authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to verify domain" },
      { status: 500 },
    );
  }
}
