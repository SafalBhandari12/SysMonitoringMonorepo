/*
  Warnings:

  - You are about to drop the column `domainId` on the `Api` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `Api` table. All the data in the column will be lost.
  - You are about to drop the `Domain` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[targetUrl]` on the table `Api` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `targetUrl` to the `Api` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Api" DROP CONSTRAINT "Api_apiGroupId_fkey";

-- DropForeignKey
ALTER TABLE "Api" DROP CONSTRAINT "Api_domainId_fkey";

-- DropForeignKey
ALTER TABLE "Domain" DROP CONSTRAINT "Domain_userId_fkey";

-- DropIndex
DROP INDEX "Api_domainId_path_key";

-- AlterTable
ALTER TABLE "Api" DROP COLUMN "domainId",
DROP COLUMN "path",
ADD COLUMN     "targetUrl" TEXT NOT NULL;

-- DropTable
DROP TABLE "Domain";

-- CreateIndex
CREATE UNIQUE INDEX "Api_targetUrl_key" ON "Api"("targetUrl");

-- CreateIndex
CREATE INDEX "Api_apiGroupId_idx" ON "Api"("apiGroupId");

-- AddForeignKey
ALTER TABLE "Api" ADD CONSTRAINT "Api_apiGroupId_fkey" FOREIGN KEY ("apiGroupId") REFERENCES "ApiGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
