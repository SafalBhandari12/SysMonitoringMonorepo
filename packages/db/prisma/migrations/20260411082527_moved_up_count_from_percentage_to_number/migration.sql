/*
  Warnings:

  - You are about to drop the column `upTime` on the `Api` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Api" DROP COLUMN "upTime",
ADD COLUMN     "upCount" INTEGER NOT NULL DEFAULT 0;
