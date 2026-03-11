import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { asyncHandler } from "./asyncHandler.js";
import { UnauthorizedError } from "../utils/customErrors.js";

export const authMiddleWare = asyncHandler(
  async (req: Request, _: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new UnauthorizedError("No token provided");
    }

    // verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      throw new UnauthorizedError("Invalid token");
    }

    // attach user info to request
    (req as any).userId = decoded.userId;
    (req as any).userEmail = decoded.email;

    next();
  },
);
