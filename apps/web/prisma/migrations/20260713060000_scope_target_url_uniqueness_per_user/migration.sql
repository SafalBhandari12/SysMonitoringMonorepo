/*
  Warnings:

  - A unique constraint covering the columns `[targetUrl]` on the table `Api` is dropped
    and replaced with a composite unique constraint on `[userId, targetUrl]`, so different
    users can monitor the same target URL but a single user cannot add the same URL twice.
  - Added the required column `userId` to the `Api` table, backfilled from `ApiGroup.userId`.

*/
-- AlterTable (add column nullable first so existing rows can be backfilled)
ALTER TABLE "Api" ADD COLUMN "userId" TEXT;

-- Backfill from the owning ApiGroup
UPDATE "Api" a
SET "userId" = ag."userId"
FROM "ApiGroup" ag
WHERE ag.id = a."apiGroupId";

-- Enforce NOT NULL now that every row has a value
ALTER TABLE "Api" ALTER COLUMN "userId" SET NOT NULL;

-- DropIndex
DROP INDEX "Api_targetUrl_key";

-- CreateIndex
CREATE UNIQUE INDEX "Api_userId_targetUrl_key" ON "Api"("userId", "targetUrl");
