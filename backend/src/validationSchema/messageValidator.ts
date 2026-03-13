import { body } from "express-validator";

export const validateCreateMessage = [
  body("conversationId").notEmpty().trim(),
  body("type").optional().isIn(["text", "image", "file", "audio", "video"]),
  body("content").notEmpty().trim(),
  body("tempId").optional().isString(),
];

export const validateEditMessage = [body("content").notEmpty().trim()];

export const validateDeleteMessage = body("messageDeletedFor")
  .notEmpty()
  .isIn(["everyone", "me"])
  .withMessage("deleteFor must be 'everyone' or 'me'");

export const validateReaction = [
  body("emoji")
    .notEmpty()
    .isIn(["❤️", "👍", "😂", "😮", "😢", "🙏"])
    .withMessage("Invalid emoji"),
];
