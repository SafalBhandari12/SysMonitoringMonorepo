/*
  Warnings:

  - You are about to drop the column `totalChecks` on the `Api` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Api" DROP COLUMN "totalChecks",
ADD COLUMN     "totalCounts" INTEGER NOT NULL DEFAULT 0;
