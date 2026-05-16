/*
  Warnings:

  - A unique constraint covering the columns `[organizationName]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboarded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "organizationName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_organizationName_key" ON "User"("organizationName");
