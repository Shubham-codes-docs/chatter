/*
  Warnings:

  - A unique constraint covering the columns `[tempId]` on the table `messages` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "tempId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "messages_tempId_key" ON "messages"("tempId");
