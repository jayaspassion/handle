-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "colorMode" TEXT,
ADD COLUMN     "font" TEXT,
ADD COLUMN     "openToWork" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "theme" TEXT;
