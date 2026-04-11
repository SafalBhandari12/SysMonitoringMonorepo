/*
  Warnings:

  - Added the required column `region` to the `ApiResponse` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "regions" AS ENUM ('SA', 'SG', 'EU', 'US', 'IN');

-- AlterTable
ALTER TABLE "Api" ADD COLUMN     "totalChecks" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ApiResponse" ADD COLUMN     "region" "regions" NOT NULL;

-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "regions" "regions"[];
