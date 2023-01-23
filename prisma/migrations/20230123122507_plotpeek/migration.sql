/*
  Warnings:

  - You are about to drop the column `summaryId` on the `Like` table. All the data in the column will be lost.
  - You are about to drop the `Summary` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,plotpeekId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `plotpeekId` to the `Like` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_summaryId_fkey";

-- DropForeignKey
ALTER TABLE "Summary" DROP CONSTRAINT "Summary_createdById_fkey";

-- DropIndex
DROP INDEX "Like_userId_summaryId_key";

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "summaryId",
ADD COLUMN     "plotpeekId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Summary";

-- CreateTable
CREATE TABLE "Plotpeek" (
    "id" SERIAL NOT NULL,
    "createdById" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "description" TEXT,
    "volume" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Plotpeek_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_plotpeekId_key" ON "Like"("userId", "plotpeekId");

-- AddForeignKey
ALTER TABLE "Plotpeek" ADD CONSTRAINT "Plotpeek_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_plotpeekId_fkey" FOREIGN KEY ("plotpeekId") REFERENCES "Plotpeek"("id") ON DELETE CASCADE ON UPDATE CASCADE;
