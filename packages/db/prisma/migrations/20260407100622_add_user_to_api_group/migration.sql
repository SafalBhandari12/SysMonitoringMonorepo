/*
  Warnings:

  - Added the required column `userId` to the `ApiGroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApiGroup" ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ApiGroup" ADD CONSTRAINT "ApiGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
