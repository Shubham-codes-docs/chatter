/*
  Warnings:

  - You are about to drop the column `replyToMessageId` on the `messages` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_replyToMessageId_fkey";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "replyToMessageId",
ADD COLUMN     "replyToId" TEXT;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
