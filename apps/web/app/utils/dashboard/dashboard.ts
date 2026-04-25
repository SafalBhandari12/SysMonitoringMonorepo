import { prisma } from "@/prisma";

const getStats = async (userId: string) => {
  const apiCount = await prisma.api.count({
    where: {
      domain: {
        userId,
      },
    },
  });
  const apiGroupsCount = await prisma.apiGroup.count({
    where: {
      userId,
    },
  });

  

  return { apiCount, apiGroupsCount };
};
