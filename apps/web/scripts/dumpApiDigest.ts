#!/usr/bin/env ts-node

import { prisma } from "../prisma";

/**
 * Usage:
 *  npx tsx apps/web/scripts/dumpApiDigest.ts <apiId> [--months=N]
 *
 * Default: creates digests for the past 3 months (rounded 5-minute buckets).
 * The script uses batched `createMany` with `skipDuplicates: true`.
 */

function parseArgs() {
  const argv = process.argv.slice(2);
  const apiId = argv[0];
  let months = 3;

  for (const arg of argv.slice(1)) {
    if (arg.startsWith("--months=")) {
      const val = Number(arg.split("=")[1]);
      if (!Number.isNaN(val) && val > 0) months = Math.floor(val);
    }
  }

  return { apiId, months };
}

function roundDownTo5(date: Date) {
  const d = new Date(date);
  const minutes = d.getUTCMinutes();
  const rounded = minutes - (minutes % 5);
  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      rounded,
      0,
      0,
    ),
  );
}

function sampleCentroids() {
  const k = 3;
  const centroids: Array<{ mean: number; count: number }> = [];
  for (let i = 0; i < k; i++) {
    centroids.push({
      mean: Math.round(Math.random() * 1000) / 10,
      count: Math.floor(Math.random() * 10) + 1,
    });
  }
  return centroids;
}

async function main() {
  const { apiId, months } = parseArgs();
  if (!apiId) {
    console.error(
      "Usage: npx ts-node apps/web/scripts/dumpApiDigest.ts <apiId> [--months=N]",
    );
    process.exit(1);
  }

  console.log(`Deleting existing ApiDigest records for apiId=${apiId}...`);
  const deletedCount = await prisma.apiDigest.deleteMany({
    where: { apiId },
  });
  console.log(`Deleted ${deletedCount.count} existing records.`);

  const end = roundDownTo5(new Date());
  const start = new Date(end);
  start.setUTCMonth(end.getUTCMonth() - months);

  const step = 5 * 60 * 1000;
  const windows: string[] = [];
  for (let t = start.getTime(); t <= end.getTime(); t += step) {
    windows.push(new Date(t).toISOString());
  }

  console.log(
    `Will attempt to insert ${windows.length} ApiDigest rows for apiId=${apiId} (past ${months} month(s)).`,
  );

  const CHUNK = 1000;
  let insertedTotal = 0;

  for (let i = 0; i < windows.length; i += CHUNK) {
    const chunk = windows.slice(i, i + CHUNK);
    const data = chunk.map((windowKey) => {
      const centroids = sampleCentroids();
      const n = centroids.reduce((s, c) => s + c.count, 0);

      // Set createdAt to the start of the day for the window
      const windowDate = new Date(windowKey);
      const dayStart = new Date(
        Date.UTC(
          windowDate.getUTCFullYear(),
          windowDate.getUTCMonth(),
          windowDate.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      );

      return {
        apiId,
        windowKey,
        digest: { centroids, n },
        createdAt: dayStart,
      };
    });

    try {
      const res = await prisma.apiDigest.createMany({
        data,
        skipDuplicates: true,
      });
      insertedTotal += res.count ?? 0;
      console.log(
        `Chunk ${i / CHUNK + 1}: attempted=${data.length} inserted=${res.count}`,
      );
    } catch (err) {
      console.error("Error inserting chunk:", err);
      await prisma.$disconnect();
      process.exit(1);
    }
  }

  console.log(
    `Done. Inserted ${insertedTotal} new ApiDigest rows (duplicates skipped).`,
  );
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
