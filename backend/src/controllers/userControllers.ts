import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/db.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { successResponse } from "../utils/apiResponse.js";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/customErrors.js";

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
    },
  });

  if (!user) throw new NotFoundError("User not found");

  return successResponse(res, "The user with the given user id is ", user);
});

// update logged in user
export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { fullName, username, bio } = req.body;

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

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return successResponse(res, "Account deleted successfully");
  },
);
