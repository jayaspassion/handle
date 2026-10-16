-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "chatEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "ChatUsage" (
    "key" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChatUsage_pkey" PRIMARY KEY ("key","day")
);

-- CreateIndex
CREATE INDEX "ChatUsage_day_idx" ON "ChatUsage"("day");
