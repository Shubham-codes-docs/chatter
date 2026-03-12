import { Router } from "express";
import {
  getAllConversations,
  getConversationById,
  createConversation,
  deleteConversationById,
} from "../controllers/conversationControllers.js";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import { validateCreateConversation } from "../validationSchema/conversationValidator.js";
import { validateRequest } from "../middleware/validate.js";

const router = Router();

// get all conversations of the loggedIn User
router.get("/", authMiddleWare, getAllConversations);

// get a user conversation by conversation Id
router.get("/:id", authMiddleWare, getConversationById);

// create a conversation
router.post(
  "/",
  authMiddleWare,
  validateCreateConversation,
  validateRequest,
  createConversation,
);

// delete a conversation
router.delete("/:id", authMiddleWare, deleteConversationById);

export default router;
