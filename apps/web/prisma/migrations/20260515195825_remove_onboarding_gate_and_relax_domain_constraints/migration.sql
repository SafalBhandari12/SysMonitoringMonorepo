/*
  Warnings:

  - You are about to drop the column `lastVerificationAttempt` on the `Domain` table. All the data in the column will be lost.
  - You are about to drop the column `verificationAttempts` on the `Domain` table. All the data in the column will be lost.
  - You are about to drop the column `verificationCode` on the `Domain` table. All the data in the column will be lost.
  - You are about to drop the column `verificationStatus` on the `Domain` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedAt` on the `Domain` table. All the data in the column will be lost.
  - You are about to drop the column `onboarded` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Domain" DROP CONSTRAINT "Domain_userId_fkey";

-- DropIndex
DROP INDEX "Domain_domain_key";

-- DropIndex
DROP INDEX "Domain_userId_key";

-- AlterTable
ALTER TABLE "Domain" DROP COLUMN "lastVerificationAttempt",
DROP COLUMN "verificationAttempts",
DROP COLUMN "verificationCode",
DROP COLUMN "verificationStatus",
DROP COLUMN "verifiedAt";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "onboarded";

-- DropEnum
DROP TYPE "DomainVerificationStatus";

-- CreateIndex
CREATE INDEX "Domain_domain_idx" ON "Domain"("domain");

-- CreateIndex
CREATE INDEX "Domain_userId_idx" ON "Domain"("userId");

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
