/*
  Warnings:

  - Made the column `apiGroupId` on table `Api` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Api" DROP CONSTRAINT "Api_apiGroupId_fkey";

-- AlterTable
ALTER TABLE "Api" ALTER COLUMN "apiGroupId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Api" ADD CONSTRAINT "Api_apiGroupId_fkey" FOREIGN KEY ("apiGroupId") REFERENCES "ApiGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
