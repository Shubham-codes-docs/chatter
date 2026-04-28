import { Request, Response } from "express";
import prisma from "../config/db.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/customErrors.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";
import { verifyConversationParticipant } from "../utils/conversationUtil.js";
import { Server } from "socket.io";
import { createMessage } from "../services/messageService.js";
import { checkRateLimit } from "../utils/rateLimiter.js";
import { getOtherParticipant } from "../services/conversationService.js";

// get messages of the logged-in user with the given conversationId
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const conversationId = req.params["id"] as string;
  const cursor = req.query["cursor"] as string | undefined;

  if (!userId) throw new UnauthorizedError("Unauthorized access");

  if (!conversationId) throw new BadRequestError("Conversation Id missing");

  // check if the logged-in user is a part of the conversation.
  await verifyConversationParticipant(conversationId, userId);

  // get the deletedFor record for this user if it exists
  const conversationDeletedFor = await prisma.conversationDeletedFor.findUnique(
    {
      where: {
        conversationId_userId: { conversationId, userId },
      },
      select: { clearedAt: true },
    },
  );

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      deletedFor: {
        none: {
          userId,
        },
      },
      ...(conversationDeletedFor && {
        createdAt: {
          gt: conversationDeletedFor.clearedAt,
        },
      }),
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatar: true,
          bio: true,
        },
      },
      reactions: true,
      replyTo: {
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
              bio: true,
            },
          },
        },
      },
      deliveries: {
        select: {
          userId: true,
          deliveredAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
  });
  return successResponse(res, "Messages fetched successfully", {
    messages,
    nextCursor:
      messages.length === 50 ? messages[messages.length - 1]?.id : null,
  });
});

// create message
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const {
    conversationId,
    content,
    type,
    replyToId,
    fileUrl,
    fileName,
    fileSize,
    tempId,
  } = req.body;

  if (!userId) throw new UnauthorizedError("Unauthorized access");

  if (!conversationId) throw new BadRequestError("Conversation Id missing");

  // check if the logged-in user is a part of the conversation.
  await verifyConversationParticipant(conversationId, userId);
  await checkRateLimit(userId, "message", 30, 60);

  // check if the sender has been blocked or has blocked the person
  const conversation = await getOtherParticipant(conversationId, userId);
  const participant = conversation?.participants[0]?.userId;
  if (conversation?.type === "direct") {
    if (participant) {
      const block = await prisma.block.findFirst({
        where: {
          OR: [
            {
              blockerId: userId,
              blockedId: participant,
            },
            {
              blockerId: participant,
              blockedId: userId,
            },
          ],
        },
      });
      if (block) throw new ForbiddenError("You cannot message this user");
    }
  }

  if (tempId) {
    const isExisting = await prisma.message.findUnique({
      where: {
        tempId,
      },
    });

    if (isExisting) {
      return successResponse(res, "Message already sent", isExisting, 200);
    }
  }

  const newMessage = await createMessage({
    conversationId,
    senderId: userId,
    content,
    type,
    replyToId,
    fileUrl,
    fileName,
    fileSize,
    tempId,
  });

  // find the members who deleted this conversation
  const deletedForUsers = await prisma.conversationDeletedFor.findMany({
    where: { conversationId },
    select: { userId: true },
  });

  // restore conversations if the message is being sent to a deleted conversation
  await prisma.conversationDeletedFor.deleteMany({
    where: { conversationId },
  });

  const io = req.app.get("io") as Server;

  if (deletedForUsers.length > 0) {
    // emit conversation_created to restore it in their sidebar
    const fullConversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
                status: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { messages: true } },
      },
    });

    deletedForUsers.forEach(({ userId: deletedUserId }) => {
      io.to(`user:${deletedUserId}`).emit("conversation_created", {
        ...fullConversation,
        unReadCount: 1,
      });
    });
  }

  io.to(conversationId).emit("message_received", newMessage);
  return successResponse(res, "Message sent successfully", newMessage, 201);
});

// edit message
export const editMessage = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const messageId = req.params["id"] as string;
  const { content } = req.body;

  if (!userId) throw new UnauthorizedError("Unauthorized access");

  if (!messageId) throw new BadRequestError("No message Id provided");

  const message = await prisma.message.findUnique({
    where: {
      id: messageId,
    },
  });

  if (!message) throw new NotFoundError("Message not found");
  if (message.deletedAt)
    throw new BadRequestError("Cannot edit a deleted message");
  if (message.senderId !== userId)
    throw new ForbiddenError("You can only edit your own messages");

  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
  if (message.createdAt < fifteenMinutesAgo) {
    throw new BadRequestError("Messages can only be edited within 15 minutes");
  }

  const updatedMessage = await prisma.message.update({
    where: { id: messageId },
    data: {
      content,
      editedAt: new Date(),
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatar: true,
          bio: true,
        },
      },
      reactions: true,
      replyTo: {
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
              bio: true,
            },
          },
        },
      },
      deliveries: {
        select: {
          userId: true,
          deliveredAt: true,
        },
      },
    },
  });

  const io = req.app.get("io") as Server;
  io.to(message.conversationId).emit("message_updated", updatedMessage);

  return successResponse(res, "Message updated successfully", updatedMessage);
});

// delete message
export const deleteMessage = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const messageId = req.params["id"] as string;

    const { messageDeletedFor } = req.body;

    if (!userId) throw new UnauthorizedError("Unauthorized access");

    if (!messageId) throw new BadRequestError("No message Id provided");

    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message)
      throw new NotFoundError(
        "The message with the given message id was not found",
      );

    if (messageDeletedFor === "everyone") {
      // check if the user sent the message or not
      if (message.senderId !== userId)
        throw new UnauthorizedError("You are not the sender of this message");

      const updatedMessage = await prisma.message.update({
        where: {
          id: messageId,
        },
        data: {
          deletedAt: new Date(),
          content: "This message was deleted",
        },
      });

      const io = req.app.get("io") as Server;
      io.to(message.conversationId).emit("message_deleted", {
        messageId,
        conversationId: message.conversationId,
      });

      return successResponse(
        res,
        "Message deleted for everyone",
        updatedMessage,
      );
    } else if (messageDeletedFor === "me") {
      // check if the logged-in user is a part of the conversation.
      await verifyConversationParticipant(message.conversationId, userId);

      const deletedRecord = await prisma.messageDeletedFor.create({
        data: {
          messageId,
          userId,
        },
      });

      return successResponse(
        res,
        "Message deleted successfully",
        deletedRecord,
      );
    }

    return errorResponse(
      res,
      "Something went wrong while deleting the message",
    );
  },
);

// create Reaction
export const createReaction = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const messageId = req.params["id"] as string;

    const { reaction } = req.body;

    if (!userId) throw new UnauthorizedError("Unauthorized access");

    if (!messageId) throw new BadRequestError("No message Id provided");

    const io = req.app.get("io") as Server;

    const message = await prisma.message.findUnique({
      where: {
        id: messageId,
      },
    });

    if (!message)
      throw new NotFoundError(
        "The message with the given message id was not found",
      );

    // check if user is a part of the conversation or not
    await verifyConversationParticipant(message.conversationId, userId);

    const messageReaction = await prisma.reaction.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      update: {
        emoji: reaction,
      },
      create: {
        messageId,
        userId,
        emoji: reaction,
      },
    });

    io.to(message.conversationId).emit("message_reaction", {
      conversationId: message.conversationId,
      messageId,
      reaction: messageReaction,
    });

    return successResponse(
      res,
      "Reacted to message successfully",
      messageReaction,
    );
  },
);
