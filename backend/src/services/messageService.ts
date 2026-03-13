import prisma from "../config/db.js";
import { MessageType } from "@prisma/client";

interface CreateMessageParams {
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  replyToMessageId?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  tempId?: string;
}

export const createMessage = async (params: CreateMessageParams) => {
  const message = await prisma.message.create({
    data: {
      senderId: params.senderId,
      conversationId: params.conversationId,
      tempId: params.tempId || null,
      content: params.content,
      type: params.type,
      replyToMessageId: params.replyToMessageId || null,
      fileName: params.fileName || null,
      fileSize: params.fileSize || null,
      fileUrl: params.fileUrl || null,
    },
    include: {
      sender: {
        select: {
          id: true,
          fullName: true,
          username: true,
          avatar: true,
        },
      },
      replyToMessage: {
        include: {
          sender: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });

  await prisma.conversation.update({
    where: {
      id: params.conversationId,
    },
    data: {
      updatedAt: new Date(),
    },
  });

  return message;
};
