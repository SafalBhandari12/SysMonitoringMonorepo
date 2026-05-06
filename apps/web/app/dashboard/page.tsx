import { auth } from "@/auth";
import { CardSmall } from "@/components/dashboard/card";
import { TimeLine } from "@/components/dashboard/Timeline";
import { prisma } from "@/prisma";
import { TDigest } from "tdigest";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-4xl font-bold">Unauthorized</h1>
      </div>
    );
  }

  const apiGroups = await prisma.apiGroup.findMany({
    where: {
      userId: session.user!.id!,
    },
  });
  const apiGroupsCount = apiGroups.length;
  const apisCount = await prisma.api.count({
    where: {
      apiGroup: {
        userId: session.user!.id!,
      },
    },
  });

  // Commented out DB call to use dummy data for Timeline testing
  const incident = await prisma.incident.findMany({
    where: {
      api: {
        apiGroup: {
          userId: session.user!.id!,
        },
      },
    },
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      title: true,
      regions: true,
      startTime: true,
      endTime: true,
      status: true,
    },
  });

  const since = new Date();
  since.setDate(since.getDate() - 90); // Last 90 days

  const apiDigests = await prisma.apiDigest.findMany({
    where: {
      api: { apiGroup: { userId: session.user!.id! } },
      windowKey: {
        gte: since.toISOString(),
      },
    },
    select: {
      digest: true,
    },
  });
  let p90: string | null;
  let p99: string | null;
  if (apiDigests.length === 0) {
    p90 = null;
    p99 = null;
  } else {
    const merged = new TDigest();
    for (const apiDigest of apiDigests) {
      const data = apiDigest.digest as {
        centroids: { mean: number; count: number }[];
        n: number;
      };
      for (const centroid of data.centroids) {
        merged.push(centroid.mean, centroid.count);
      }
    }
    p90 = merged.percentile(0.9).toPrecision(3);
    p99 = merged.percentile(0.99).toPrecision(3);
  }

  return (
    <div className="h-screen">
      <h1 className="text-4xl font-bold">Dashboard</h1>

      {session.user?.name && (
        <p className="text-xl">Welcome, {session.user.name}!</p>
      )}
      <div className="flex gap-4">
        <CardSmall title="Api Groups" value={`${apiGroupsCount}`} />
        <CardSmall title="Apis" value={`${apisCount}`} />
        <CardSmall
          title="Incidents"
          value={`${incident.length}/${apisCount}`}
        />
        <CardSmall
          title="P90 Response Time"
          value={p90 ? `${p90} ms` : "N/A"}
        />
        <CardSmall
          title="P99 Response Time"
          value={p99 ? `${p99} ms` : "N/A"}
        />
      </div>
      <div className="flex flex-row justify-between">
        <div>Hello, World!</div>
        <TimeLine incidents={incident} />
      </div>
    </div>
  );
}
