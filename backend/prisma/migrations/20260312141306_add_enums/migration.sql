/*
  Warnings:

  - Changed the type of `type` on the `conversations` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `messages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('direct', 'group');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'image', 'file', 'audio', 'video');

-- AlterTable
ALTER TABLE "conversations" DROP COLUMN "type",
ADD COLUMN     "type" "ConversationType" NOT NULL;

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "type",
ADD COLUMN     "type" "MessageType" NOT NULL;
