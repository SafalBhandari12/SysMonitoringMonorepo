"use server";

import { getUserId } from "@/lib/auth-utils";
import { prisma } from "@/prisma";

export default async function addApiGroupAction(formData: FormData) {
  const userId = await getUserId();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string | undefined;

  await prisma.apiGroup.create({
    data: {
      name,
      description: description,
      userId,
    },
  });
}
