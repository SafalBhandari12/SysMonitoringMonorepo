import { signOut } from "@/auth";
import { getUserId } from "@/lib/auth-utils";
import verifyDomain from "@/lib/onboarding/verifyDomain";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const userId = await getUserId();
    const domainRecord = await prisma.domain.findFirst({
      where: {
        userId,
      },
    });

    if (!domainRecord) {
      return NextResponse.json({ success: false, verified: false });
    }

    const isVerified = await verifyDomain(
      domainRecord.domain,
      domainRecord.verificationCode,
      "BOTH",
    );

    if (!isVerified) {
      return NextResponse.json({ success: true, verified: false });
    }

    await prisma.domain.update({
      where: {
        id: domainRecord.id,
      },
      data: {
        verificationStatus: "VERIFIED",
      },
    });
    await prisma.user.update({
      where: { id: userId },
      data: {
        onboarded: true,
      },
    });
    await signOut({ redirect: false });

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
