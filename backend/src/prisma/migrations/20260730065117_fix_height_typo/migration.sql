/*
  Warnings:

  - You are about to drop the column `heigth` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "heigth",
ADD COLUMN     "height" DOUBLE PRECISION;
