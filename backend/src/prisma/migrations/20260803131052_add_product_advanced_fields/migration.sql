-- CreateEnum
CREATE TYPE "Pace" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "creatorId" TEXT,
ADD COLUMN     "isCustom" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pieceName" TEXT,
ADD COLUMN     "pieceWeight" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pace" "Pace" DEFAULT 'MEDIUM',
ADD COLUMN     "targetWeight" DOUBLE PRECISION;
