/*
  Warnings:

  - You are about to drop the column `averageResponseTime` on the `Api` table. All the data in the column will be lost.
  - You are about to drop the column `p90ResponseTime` on the `Api` table. All the data in the column will be lost.
  - You are about to drop the column `p99ResponseTime` on the `Api` table. All the data in the column will be lost.
  - You are about to drop the column `totalCount` on the `DailyStats` table. All the data in the column will be lost.
  - You are about to drop the column `upCount` on the `DailyStats` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Api" DROP COLUMN "averageResponseTime",
DROP COLUMN "p90ResponseTime",
DROP COLUMN "p99ResponseTime";

-- AlterTable
ALTER TABLE "DailyStats" DROP COLUMN "totalCount",
DROP COLUMN "upCount";

-- CreateTable
CREATE TABLE "ApiMetrics" (
    "id" TEXT NOT NULL,
    "apiId" TEXT NOT NULL,
    "region" "regions" NOT NULL,
    "averageResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "p90ResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "p99ResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyStatsRegion" (
    "id" TEXT NOT NULL,
    "apiId" TEXT NOT NULL,
    "dailyStatsId" TEXT NOT NULL,
    "region" "regions" NOT NULL,
    "upCount" INTEGER NOT NULL DEFAULT 0,
    "totalCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyStatsRegion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiMetrics_apiId_key" ON "ApiMetrics"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiMetrics_apiId_region_key" ON "ApiMetrics"("apiId", "region");

-- CreateIndex
CREATE UNIQUE INDEX "DailyStatsRegion_dailyStatsId_region_key" ON "DailyStatsRegion"("dailyStatsId", "region");

-- AddForeignKey
ALTER TABLE "ApiMetrics" ADD CONSTRAINT "ApiMetrics_apiId_fkey" FOREIGN KEY ("apiId") REFERENCES "Api"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyStatsRegion" ADD CONSTRAINT "DailyStatsRegion_dailyStatsId_fkey" FOREIGN KEY ("dailyStatsId") REFERENCES "DailyStats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
