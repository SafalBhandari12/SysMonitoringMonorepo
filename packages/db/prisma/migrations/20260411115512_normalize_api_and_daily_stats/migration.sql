/*
  Warnings:

  - You are about to drop the column `totalCounts` on the `Api` table. All the data in the column will be lost.
  - You are about to drop the column `upCount` on the `Api` table. All the data in the column will be lost.
  - You are about to drop the column `upTime` on the `DailyStats` table. All the data in the column will be lost.
  - You are about to drop the `DailyStatsRegion` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[date,region]` on the table `DailyStats` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `region` to the `DailyStats` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DailyStatsRegion" DROP CONSTRAINT "DailyStatsRegion_dailyStatsId_fkey";

-- DropIndex
DROP INDEX "DailyStats_apiId_date_key";

-- AlterTable
ALTER TABLE "Api" DROP COLUMN "totalCounts",
DROP COLUMN "upCount";

-- AlterTable
ALTER TABLE "ApiMetrics" ADD COLUMN     "totalCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "upCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "DailyStats" DROP COLUMN "upTime",
ADD COLUMN     "region" "regions" NOT NULL,
ADD COLUMN     "totalCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "upCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "DailyStatsRegion";

-- CreateIndex
CREATE UNIQUE INDEX "DailyStats_date_region_key" ON "DailyStats"("date", "region");
