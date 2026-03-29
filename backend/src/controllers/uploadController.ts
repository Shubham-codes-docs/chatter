import { Request, Response } from "express";
import { uploadFile } from "../services/uploadService.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { BadRequestError } from "../utils/customErrors.js";
import { successResponse } from "../utils/apiResponse.js";

export const handleFileUpload = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      throw new BadRequestError("No files were uploaded");
    }
    const type = req.query["type"] as string | undefined;
    const result = await uploadFile(req.files as Express.Multer.File[], type);
    return successResponse(
      res,
      "File uploaded successfully",
      type === "avatar" ? result[0] : result,
    );
  },
);
