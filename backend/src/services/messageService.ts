import prisma from "../config/db.js";
import { MessageType } from "@prisma/client";

interface CreateMessageParams {
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  replyToId?: string;
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
      replyToId: params.replyToId || null,
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
      replyTo: {
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
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
