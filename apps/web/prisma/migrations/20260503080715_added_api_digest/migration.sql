-- CreateTable
CREATE TABLE "ApiDigest" (
    "id" TEXT NOT NULL,
    "apiId" TEXT NOT NULL,
    "windowKey" TEXT NOT NULL,
    "digest" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiDigest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiDigest_apiId_windowKey_key" ON "ApiDigest"("apiId", "windowKey");

-- AddForeignKey
ALTER TABLE "ApiDigest" ADD CONSTRAINT "ApiDigest_apiId_fkey" FOREIGN KEY ("apiId") REFERENCES "Api"("id") ON DELETE CASCADE ON UPDATE CASCADE;
