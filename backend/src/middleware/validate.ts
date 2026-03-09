import { Request, Response, NextFunction } from "express";
import {
  validationResult,
  ValidationError as ExpressValidationError,
} from "express-validator";
import { ValidationError } from "../utils/customErrors.js";

export const validateRequest = (
  req: Request,
  _: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((error: ExpressValidationError) => {
        return error.msg;
      });

    throw new ValidationError(errorMessages.join(", "));
  }
  next();
};
