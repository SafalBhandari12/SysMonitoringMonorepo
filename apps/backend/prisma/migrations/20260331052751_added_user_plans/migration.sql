/*
  Warnings:

  - You are about to drop the column `averageResponseTime` on the `Api` table. All the data in the column will be lost.
  - You are about to drop the column `p90` on the `Api` table. All the data in the column will be lost.
  - You are about to drop the column `p99` on the `Api` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "incidentStatusEnum" AS ENUM ('ONGOING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "plans" AS ENUM ('FREE', 'PROFESSIONAL', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "Api" DROP COLUMN "averageResponseTime",
DROP COLUMN "p90",
DROP COLUMN "p99",
ADD COLUMN     "pathParams" JSONB,
ADD COLUMN     "queryParams" JSONB;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userPlan" "plans" NOT NULL DEFAULT 'FREE';

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "apiId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "status" "incidentStatusEnum" NOT NULL DEFAULT 'ONGOING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Incident_apiId_createdAt_idx" ON "Incident"("apiId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ApiResponse_apiId_createdAt_idx" ON "ApiResponse"("apiId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_apiId_fkey" FOREIGN KEY ("apiId") REFERENCES "Api"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
