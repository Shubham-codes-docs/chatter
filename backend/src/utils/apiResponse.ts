import { Response } from "express";

export const successResponse = <T>(
  res: Response,
  message: string,
  data: T | null = null,
  statusCode: number = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number = 400,
  errors: unknown = null,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
