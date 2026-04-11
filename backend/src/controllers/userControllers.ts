import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/db.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/customErrors.js";
import redis from "../config/redis.js";

// search users by userName or email or fullName
export const searchUsersByQuery = asyncHandler(
  async (req: Request, res: Response) => {
    const q = req.query["q"];

    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            email: {
              contains: q as string,
              mode: "insensitive",
            },
          },
          {
            username: {
              contains: q as string,
              mode: "insensitive",
            },
          },
          {
            fullName: {
              contains: q as string,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatar: true,
        status: true,
        bio: true,
      },
      take: 10,
    });
    return successResponse(res, "The users with the given details are", users);
  },
);

// get user by given user id
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params["id"] as string;

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      username: true,
      fullName: true,
      avatar: true,
      status: true,
      bio: true,
      createdAt: true,
    },
  });

  if (!user) throw new NotFoundError("User not found");

  return successResponse(res, "The user with the given user id is ", user);
});

// update logged in user
export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { fullName, username, bio, avatar } = req.body;

    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: {
          username,
        },
        select: {
          id: true,
        },
      });

      if (existingUser && existingUser.id !== userId)
        throw new ConflictError("User name already exists");
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(fullName && { fullName }),
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
        ...(avatar && { avatar: avatar }),
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatar: true,
        bio: true,
        status: true,
      },
    });

    return successResponse(res, "User updated successfully", updatedUser);
  },
);

// update password
export const updateUserPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { currentPassword, newPassword } = req.body;

    // get the user first
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        password: true,
      },
    });

    if (!user) throw new NotFoundError("User not found");

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isValidPassword)
      throw new UnauthorizedError("Current passwords do not match");

    const newHashedPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        password: newHashedPassword,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
      },
    });

    return successResponse(res, "Password updated successfully", updatedUser);
  },
);

// delete user account
export const deleteUserAccount = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { email } = req.body;

    // get the user first
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        email: true,
      },
    });

    if (!user) throw new NotFoundError("User not found");

    // verify if the given email is the registered email for the user
    const verifyEmail = user.email === email;

    if (!verifyEmail)
      throw new UnauthorizedError(
        "Please give your registered email to delete your account",
      );

    // find all groups where user is a participant
    const groupParticipations = await prisma.conversationParticipant.findMany({
      where: { userId, conversation: { type: "group" } },
      include: {
        conversation: {
          include: {
            participants: true,
          },
        },
      },
    });

    for (const participation of groupParticipations) {
      const conversation = participation.conversation;
      const otherParticipants = conversation.participants.filter(
        (p) => p.userId !== userId,
      );

      // if user is the only member — delete the group
      if (otherParticipants.length === 0) {
        await prisma.conversation.delete({
          where: { id: conversation.id },
        });
        continue;
      }

      // if user is the last admin promote the longest standing member to admin
      const isAdmin = participation.role === "admin";
      if (isAdmin) {
        const otherAdmins = otherParticipants.filter((p) => p.role === "admin");
        if (otherAdmins.length === 0) {
          // promote the longest standing member
          const oldestMember = otherParticipants.sort(
            (a, b) =>
              new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime(),
          )[0];
          await prisma.conversationParticipant.update({
            where: {
              conversationId_userId: {
                conversationId: conversation.id,
                userId: oldestMember?.userId!,
              },
            },
            data: {
              role: "admin",
            },
          });
        }
      }
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return successResponse(res, "Account deleted successfully");
  },
);

// get the online status of the users from redis
export const getParticipantsOnlineStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;

    // get all unique participant ids from user's conversations
    const participants = await prisma.conversationParticipant.findMany({
      where: {
        conversation: {
          participants: {
            some: { userId },
          },
        },
        userId: { not: userId }, // exclude self
      },
      select: { userId: true },
      distinct: ["userId"],
    });

    // check Redis for each participant's status
    const statuses = await Promise.all(
      participants.map(async (p) => {
        const status = await redis.get(`user:${p.userId}:status`);
        return {
          userId: p.userId,
          isOnline: status === "online",
        };
      }),
    );

    return successResponse(res, "Online statuses fetched", statuses);
  },
);

// block a user
export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  const blockerId = (req as any).userId;
  const blockedId = req.params["id"] as string;

  if (blockedId === blockerId)
    throw new BadRequestError("You cannot block yourself");

  const blockedUser = await prisma.block.upsert({
    where: {
      blockerId_blockedId: {
        blockedId,
        blockerId,
      },
    },
    create: { blockerId, blockedId },
    update: {},
  });

  return successResponse(res, "User Blocked successfully", blockedUser);
});

// unblock a user
export const unBlockUser = asyncHandler(async (req: Request, res: Response) => {
  const blockerId = (req as any).userId;
  const blockedId = req.params["id"] as string;

  await prisma.block.delete({
    where: {
      blockerId_blockedId: { blockerId, blockedId },
    },
  });

  return successResponse(res, "User unblocked successfully");
});

// get all blocked users
export const getBlockedUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;

    if (!userId) throw new UnauthorizedError("User not found");

    const blocked = await prisma.block.findMany({
      where: { blockerId: userId },
      include: {
        blocked: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    return successResponse(res, "Blocked users fetched", blocked);
  },
);
