import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../config/db.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import {
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from "../utils/customErrors.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// register new user
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, password, fullName } = req.body;

  // check for existing user
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    throw new ConflictError("User with this email or username already exists");
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      fullName,
      password: hashedPassword,
    },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      createdAt: true,
      avatar: true,
      bio: true,
    },
  });

  // generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });
  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
  });

  return res.status(201).json({
    message: "User registered successfully",
    user,
    accessToken,
    refreshToken,
  });
});

// login user
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new NotFoundError("Invalid email or password");
  }

  // compare password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ForbiddenError("Invalid email or password");
  }

  // generate tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });
  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
  });

  const { password: _, ...userWithoutPassword } = user;

  return res.status(200).json({
    message: "Login successful",
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  });
});

// Get current user
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        avatar: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return res.json({ user });
  },
);
