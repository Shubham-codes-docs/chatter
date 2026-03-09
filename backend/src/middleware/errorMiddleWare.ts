import { Request, Response } from "express";
import { AppError, NotFoundError } from "../utils/customErrors.js";

// Not found handler (404)
export const notFound = (req: Request) => {
  throw new NotFoundError(`Route not found - ${req.originalUrl}`);
};

// Main error handler
export const errorHandler = (
  err: Error | AppError,
  _: Request,
  res: Response,
) => {
  // Log error in development
  if (process.env["NODE_ENV"] === "development") {
    console.error("❌ Error:", err);
  }

  // Handle known AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(process.env["NODE_ENV"] === "development" && { stack: err.stack }),
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Token expired",
    });
  }

  // Handle Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    const prismaError = err as any;

    // Unique constraint violation
    if (prismaError.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: `${prismaError.meta?.target?.[0] || "Field"} already exists`,
      });
    }

    // Record not found
    if (prismaError.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: "Record not found",
      });
    }
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // Default to 500 server error
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  return res.status(statusCode).json({
    success: false,
    error:
      process.env["NODE_ENV"] === "production"
        ? "Internal server error"
        : err.message,
    ...(process.env["NODE_ENV"] === "development" && { stack: err.stack }),
  });
};
