import { auth } from "@/auth";
import InputFieldgroup from "@/components/onboarding/domainRegistration";
import { prisma } from "@/prisma";

export default async function Onboarding() {
  const userDetails = await auth();

  const userId = userDetails!.user?.id!;

  const hasDomain = await prisma.domain.findFirst({
    where: {
      userId,
    },
  });
  if (!hasDomain) {
    return <InputFieldgroup />;
  }

  return (
    <div>
      <p>Hello</p>
    </div>
  );
}
