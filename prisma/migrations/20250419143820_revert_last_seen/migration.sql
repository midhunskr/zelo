/*
  Warnings:

  - You are about to drop the column `lastSeen` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `online` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "lastSeen",
DROP COLUMN "online";
