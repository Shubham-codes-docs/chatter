/*
  Warnings:

  - You are about to drop the column `isRestored` on the `conversation_deleted_for` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "conversation_deleted_for" DROP COLUMN "isRestored";
