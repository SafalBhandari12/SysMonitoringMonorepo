/*
  Warnings:

  - A unique constraint covering the columns `[apiId,date,region]` on the table `DailyStats` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "DailyStats_date_region_key";

-- AlterTable
ALTER TABLE "DailyStats" ADD COLUMN     "p90ResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "p99ResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "DailyStats_apiId_date_region_key" ON "DailyStats"("apiId", "date", "region");
