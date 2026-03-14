import { Request, Response } from "express";
import prisma from "../config/db.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/customErrors.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import { verifyConversationParticipant } from "../utils/conversationUtil.js";

// get all conversation for the loggedIn user
export const getAllConversations = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;

    if (!userId) throw new UnauthorizedError("Unauthorized access");

    const conversations = await prisma.conversation.findMany({
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
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "all conversations with the user",
      conversations,
    });
  },
);

// create a new conversation
export const createConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const { type } = req.body;
    const userId = (req as any).userId;

    if (type === "direct") {
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: "direct",
          AND: [
            { participants: { some: { userId } } },
            { participants: { some: { userId: req.body.participantIds[0] } } },
          ],
        },
      });

      if (existingConversation) {
        return res.status(200).json({
          success: true,
          message: "Conversation already exists",
          conversation: existingConversation,
        });
      }

      await prisma.conversation.create({
        data: {
          type,
          createdBy: userId,
          participants: {
            create: [userId, ...req.body.participantsIds].map((id: string) => {
              return {
                userId: id,
                role: "member",
              };
            }),
          },
        },
      });

      return res.status(201).json({
        success: true,
        message: "conversation created successfully",
      });
    } else if (type === "group") {
      await prisma.conversation.create({
        data: {
          type,
          name: req.body.name,
          avatar: req.body.avatar || "",
          description: req.body.description || "",
          createdBy: userId,
          participants: {
            create: [userId, ...req.body.participantsIds].map((id: string) => {
              return {
                userId: id,
                role: id === userId ? "admin" : "member",
              };
            }),
          },
        },
      });

      return res.status(201).json({
        success: true,
        message: "conversation created successfully",
      });
    }

    return res.status(400).json({
      success: true,
      message: "conversation creation failed",
    });
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

    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    // check user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.userId === userId,
    );
    if (!isParticipant)
      throw new UnauthorizedError("You are not part of this conversation");

    return res.status(200).json({
      success: true,
      message: "all conversations with the conversation Id",
      conversation,
    });
  },
);

// delete a conversation
export const deleteConversationById = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const conversationId = req.params["id"] as string;

    if (!userId) throw new UnauthorizedError("Unauthorized access");

    // check if the user is a part of the conversation
    const conversations = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    const isParticipant = conversations?.participants.some(
      (p) => p.userId === userId,
    );

    if (!isParticipant)
      throw new UnauthorizedError("You are not part of this conversation");

    await prisma.conversation.delete({
      where: {
        id: conversationId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "all conversations with the conversation Id deleted",
      conversations,
    });
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

    return successResponse(
      res,
      "Group info updated successfully",
      updatedConversation,
    );
  },
);
