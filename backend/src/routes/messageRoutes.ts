import { Router } from "express";
import {
  createReaction,
  deleteMessage,
  editMessage,
  getMessages,
  sendMessage,
} from "../controllers/messageController.js";
import {
  validateCreateMessage,
  validateDeleteMessage,
  validateEditMessage,
  validateReaction,
} from "../validationSchema/messageValidator.js";
import { validateRequest } from "../middleware/validate.js";
import { authMiddleWare } from "../middleware/authMiddleWare.js";

const router = Router();

// get all messages of the logged in user for the conversation
router.get("/:id", authMiddleWare, getMessages);

// create a message for the given conversation
router.post(
  "/",
  authMiddleWare,
  validateCreateMessage,
  validateRequest,
  sendMessage,
);

// edit message
router.put(
  "/:id",
  authMiddleWare,
  validateEditMessage,
  validateRequest,
  editMessage,
);

// delete message
router.delete(
  "/:id",
  authMiddleWare,
  validateDeleteMessage,
  validateRequest,
  deleteMessage,
);

// react to message
router.post(
  "/:id/reactions",
  authMiddleWare,
  validateReaction,
  validateRequest,
  createReaction,
);

export default router;
