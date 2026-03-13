-- CreateTable
CREATE TABLE "message_deleted_for" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_deleted_for_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "message_deleted_for_messageId_userId_key" ON "message_deleted_for"("messageId", "userId");

-- AddForeignKey
ALTER TABLE "message_deleted_for" ADD CONSTRAINT "message_deleted_for_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
