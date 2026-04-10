import { Router } from "express";
import {
  deleteUserValidation,
  searchUserValidation,
  updatePasswordValidation,
  updateUserProfileValidation,
} from "../validationSchema/userValidator.js";
import { validateRequest } from "../middleware/validate.js";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import {
  blockUser,
  deleteUserAccount,
  getBlockedUsers,
  getParticipantsOnlineStatus,
  getUserById,
  searchUsersByQuery,
  unBlockUser,
  updateUserPassword,
  updateUserProfile,
} from "../controllers/userControllers.js";

const router = Router();

// get all searched users
router.get(
  "/search",
  authMiddleWare,
  searchUserValidation,
  validateRequest,
  searchUsersByQuery,
);

// get all blocked users
router.get("/blocked", authMiddleWare, getBlockedUsers);

// get online status of the users
router.get("/online-status", authMiddleWare, getParticipantsOnlineStatus);

// get user by id
router.get("/:id", getUserById);

// update user by id
router.put(
  "/profile",
  authMiddleWare,
  updateUserProfileValidation,
  validateRequest,
  updateUserProfile,
);

// update user password
router.put(
  "/password",
  authMiddleWare,
  updatePasswordValidation,
  validateRequest,
  updateUserPassword,
);

// delete user account
router.delete(
  "/account",
  authMiddleWare,
  deleteUserValidation,
  validateRequest,
  deleteUserAccount,
);

// block user
router.post("/:id/block", authMiddleWare, blockUser);
// unblock user
router.delete("/:id/block", authMiddleWare, unBlockUser);

export default router;
