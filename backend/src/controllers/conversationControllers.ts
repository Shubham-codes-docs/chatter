import { Request, Response } from "express";
import prisma from "../config/db.js";
import { UnauthorizedError } from "../utils/customErrors.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

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
