import { Request, Response } from "express";
import prisma from "../config/db.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/customErrors.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";
import { verifyConversationParticipant } from "../utils/conversationUtil.js";
import { getFullConversation } from "../services/conversationService.js";
import { Server } from "socket.io";

// get all conversation for the loggedIn user
export const getAllConversations = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;

    if (!userId) throw new UnauthorizedError("Unauthorized access");

    const allConversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: userId,
          },
        },
      },
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
          where: {
            deletedFor: {
              none: {
                userId,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // get all deleted conversations for this user
    const deletedConversations = await prisma.conversationDeletedFor.findMany({
      where: {
        userId,
      },
      select: {
        conversationId: true,
        clearedAt: true,
      },
    });

    // filter out the conversations that do not have a new message after the clearedAt time
    const deletedMap = new Map(
      deletedConversations.map((item) => [item.conversationId, item.clearedAt]),
    );

    const visibleConversations = await Promise.all(
      allConversations.map(async (conversation) => {
        const clearedAt = deletedMap.get(conversation.id);
        if (!clearedAt) return conversation;

        // check if any new message is there after the clearedAt time
        const hasNewMessage = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            createdAt: {
              gt: clearedAt,
            },
          },
        });
        return hasNewMessage ? conversation : null;
      }),
    );

    type ConversationWithIncludes = (typeof allConversations)[number];
    const conversations = visibleConversations.filter(
      Boolean,
    ) as ConversationWithIncludes[];

    const conversationsWithUnreadCount = await Promise.all(
      conversations.map(async (conversation) => {
        const participant = conversation.participants.find(
          (p) => p.userId === userId,
        );
        const clearedAt = deletedMap.get(conversation.id);
        const unReadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: {
              not: userId,
            },
            deletedAt: null,
            ...(clearedAt && { createdAt: { gt: clearedAt } }),
            ...(participant?.lastReadAt && {
              createdAt: { gt: participant.lastReadAt },
            }),
          },
        });
        return { ...conversation, unReadCount };
      }),
    );

    return successResponse(
      res,
      "all conversations with the user",
      conversationsWithUnreadCount,
    );
  },
);

// create a new conversation
export const createConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const { type, participantIds } = req.body;
    const userId = (req as any).userId;

    const io = req.app.get("io") as Server;

    if (type === "direct") {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: "direct",
          AND: [
            { participants: { some: { userId } } },
            { participants: { some: { userId: participantIds[0] } } },
          ],
        },
      });

      if (existingConversation) {
        await prisma.conversationDeletedFor.deleteMany({
          where: {
            conversationId: existingConversation.id,
            userId: { in: [userId, participantIds[0]] },
          },
        });
        return successResponse(
          res,
          "Conversation already exists",
          existingConversation,
        );
      }

      const createdConversation = await prisma.conversation.create({
        data: {
          type,
          createdBy: userId,
          participants: {
            create: [userId, ...participantIds].map((id: string) => {
              return {
                userId: id,
                role: "member",
              };
            }),
          },
        },
      });

      const fullConversation = await getFullConversation(
        createdConversation.id,
      );

      // emit the created conversation to all the users
      participantIds.forEach((id: string) => {
        // get all the sockets belonging to the user so they can join the conversation room
        const socketsInRoom = io.sockets.adapter.rooms.get(`user:${id}`);

        if (socketsInRoom) {
          socketsInRoom.forEach((socketId: string) => {
            const participantSocket = io.sockets.sockets.get(socketId);
            participantSocket?.join(createdConversation.id);
          });
        }

        io.to(`user:${id}`).emit("conversation_created", {
          ...fullConversation,
          unReadCount: 0,
        });
      });

      return successResponse(res, "Conversation created successfully", {
        ...fullConversation,
        unReadCount: 0,
      });
    } else if (type === "group") {
      const createdConversation = await prisma.conversation.create({
        data: {
          type,
          name: req.body.name,
          avatar: req.body.avatar || null,
          description: req.body.description || null,
          createdBy: userId,
          participants: {
            create: [userId, ...participantIds].map((id: string) => {
              return {
                userId: id,
                role: id === userId ? "admin" : "member",
              };
            }),
          },
        },
      });
      const fullConversation = await getFullConversation(
        createdConversation.id,
      );

      // emit the created conversation to all the users
      participantIds.forEach((id: string) => {
        // get all the sockets belonging to the user so they can join the conversation room
        const socketsInRoom = io.sockets.adapter.rooms.get(`user:${id}`);

        if (socketsInRoom) {
          socketsInRoom.forEach((socketId: string) => {
            const participantSocket = io.sockets.sockets.get(socketId);
            participantSocket?.join(createdConversation.id);
          });
        }
        io.to(`user:${id}`).emit("conversation_created", {
          ...fullConversation,
          unReadCount: 0,
        });
      });

      return successResponse(res, "Conversation created successfully", {
        ...fullConversation,
        unReadCount: 0,
      });
    }

    return errorResponse(res, "Conversation creation failed", 400);
  },
);

// get conversation based on conversationId
export const getConversationById = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const conversationId = req.params["id"] as string;

    if (!userId) throw new UnauthorizedError("Unauthorized access");

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
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
          orderBy: {
            createdAt: "desc",
          },
          take: 50,
        },
      },
    });

    if (!conversation) throw new NotFoundError("Conversation not found");

    // check user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId,
    );
    if (!isParticipant)
      throw new UnauthorizedError("You are not part of this conversation");

    return successResponse(
      res,
      "Conversation fetched successfully",
      conversation,
    );
  },
);

// delete a conversation
export const deleteConversationById = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const conversationId = req.params["id"] as string;

    if (!userId) throw new UnauthorizedError("Unauthorized access");

    // check if the user is a part of the conversation
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        participants: true,
      },
    });

    if (!conversation) throw new NotFoundError("Conversation not found");

    const io = req.app.get("io") as Server;

    if (conversation.type === "direct") {
      await prisma.conversationDeletedFor.upsert({
        where: {
          conversationId_userId: {
            conversationId,
            userId,
          },
        },
        create: {
          conversationId,
          userId,
          clearedAt: new Date(),
        },
        update: {
          clearedAt: new Date(),
        },
      });

      // notify only this user
      io.to(`user:${userId}`).emit("conversation_deleted", { conversationId });

      return successResponse(res, "Conversation deleted successfully");
    }

    const participant = conversation.participants.find(
      (p) => p.userId === userId,
    );

    if (!participant)
      throw new UnauthorizedError("You are not part of this conversation");

    // group conversation can be deleted by admins only
    if (conversation.type === "group") {
      if (participant.role !== "admin")
        throw new ForbiddenError("Only admins can delete the conversation");
    }

    await prisma.conversation.delete({
      where: {
        id: conversationId,
      },
    });

    // emit the deleted conversation to all the users
    conversation.participants.forEach((p) => {
      io.to(`user:${p.userId}`).emit("conversation_deleted", {
        conversationId,
      });
    });

    return successResponse(res, "Conversation deleted successfully");
  },
);

// add participants to group
export const addParticipants = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const conversationId = req.params["id"] as string;
    const { conversationParticipants } = req.body;

    // get the conversation
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      select: {
        id: true,
        type: true,
      },
    });

    if (!conversation) throw new NotFoundError("Conversation not found");

    if (conversation.type !== "group")
      throw new BadRequestError(
        "Participants can be added only in group chats",
      );

    // check if the user is an admin or not
    const isAdmin = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      select: {
        role: true,
        id: true,
      },
    });

    if (isAdmin?.role !== "admin")
      throw new ForbiddenError("Only admins can add participants");

    const updatedGroup = await prisma.conversationParticipant.createMany({
      data: conversationParticipants.map((id: string) => {
        return {
          conversationId,
          userId: id,
          role: "member",
        };
      }),
      skipDuplicates: true,
    });

    return successResponse(
      res,
      "Participants added to the group successfully",
      updatedGroup,
      200,
    );
  },
);

// remove participants from group
export const removeParticipants = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const conversationId = req.params["id"] as string;
    const targetId = req.params["userId"] as string;

    // get the conversation
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      select: {
        id: true,
        type: true,
      },
    });

    if (!conversation) throw new NotFoundError("Conversation not found");

    // verify if the user is part of the conversation
    await verifyConversationParticipant(conversationId, userId);

    if (conversation.type !== "group")
      throw new BadRequestError(
        "Participants can be removed only from group chats",
      );

    const isAdmin = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      select: {
        role: true,
        id: true,
      },
    });

    if (isAdmin?.role !== "admin" && userId !== targetId)
      throw new ForbiddenError("Only admins can remove participants");

    const admins = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        role: "admin",
      },
      select: {
        role: true,
        userId: true,
      },
    });

    if (admins.length === 1 && admins[0]?.userId === targetId)
      throw new BadRequestError(
        "Cannot remove the last admin. Promote another member first",
      );

    const updatedGroup = await prisma.conversationParticipant.delete({
      where: {
        conversationId_userId: {
          conversationId,
          userId: targetId,
        },
      },
    });

    const io = req.app.get("io") as Server;
    io.to(`user:${targetId}`).emit("conversation_deleted", {
      conversationId,
    });

    return successResponse(
      res,
      "Participant removed from the group successfully",
      updatedGroup,
      200,
    );
  },
);

// update participant role
export const updateParticipantRole = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const conversationId = req.params["id"] as string;
    const targetId = req.params["userId"] as string;
    const { role } = req.body;

    // get the conversation
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      select: {
        id: true,
        type: true,
      },
    });

    if (!conversation) throw new NotFoundError("Conversation not found");

    if (conversation.type !== "group")
      throw new BadRequestError(
        "Participants can be made admins only for group chats",
      );

    const isAdmin = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      select: {
        role: true,
        id: true,
      },
    });

    if (isAdmin?.role !== "admin")
      throw new ForbiddenError("Only admins can promote participants");

    if (role === "member" && targetId === userId) {
      const admins = await prisma.conversationParticipant.findMany({
        where: {
          conversationId,
          role: "admin",
        },
        select: {
          role: true,
          userId: true,
        },
      });

      if (admins.length === 1 && admins[0]?.userId === targetId)
        throw new BadRequestError(
          "Cannot remove the last admin. Promote another member first",
        );
    }

    const updatedRole = await prisma.conversationParticipant.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: targetId,
        },
      },
      data: {
        role,
      },
    });

    return successResponse(
      res,
      "Participant role modified successfully",
      updatedRole,
      200,
    );
  },
);

// update group info
export const updateGroupInfo = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const conversationId = req.params["id"] as string;
    const { name, description } = req.body;

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true, type: true },
    });

    if (!conversation) throw new NotFoundError("Conversation not found");
    if (conversation.type !== "group")
      throw new BadRequestError("Only group info can be updated");

    const isAdmin = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      select: { role: true },
    });

    if (isAdmin?.role !== "admin")
      throw new ForbiddenError("Only admins can update group info");

    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
    });

    const io = req.app.get("io") as Server;
    io.to(conversationId).emit("conversation_updated", {
      conversationId,
      name: updatedConversation.name,
      description: updatedConversation.description,
    });

    return successResponse(
      res,
      "Group info updated successfully",
      updatedConversation,
    );
  },
);
