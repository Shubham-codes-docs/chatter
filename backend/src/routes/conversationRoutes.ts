import { Router } from "express";
import {
  getAllConversations,
  getConversationById,
  createConversation,
  deleteConversationById,
  addParticipants,
  removeParticipants,
  updateParticipantRole,
  updateGroupInfo,
} from "../controllers/conversationControllers.js";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import {
  validateAddParticipants,
  validateCreateConversation,
  validateRemoveParticipant,
  validateUpdateGroupInfo,
  validateUpdateParticipantRole,
} from "../validationSchema/conversationValidator.js";
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

// update group info
router.put(
  "/:id",
  authMiddleWare,
  validateUpdateGroupInfo,
  validateRequest,
  updateGroupInfo,
);

// delete a conversation
router.delete("/:id", authMiddleWare, deleteConversationById);

// add participants to the conversation
router.post(
  "/:id/participants",
  authMiddleWare,
  validateAddParticipants,
  validateRequest,
  addParticipants,
);

// remove participants from the conversation
router.delete(
  "/:id/participants/:userId",
  authMiddleWare,
  validateRemoveParticipant,
  validateRequest,
  removeParticipants,
);

// update the roles of the members
router.put(
  "/:id/participants/:userId",
  authMiddleWare,
  validateUpdateParticipantRole,
  validateRequest,
  updateParticipantRole,
);

export default router;
