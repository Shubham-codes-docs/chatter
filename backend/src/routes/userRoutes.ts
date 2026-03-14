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
  deleteUserAccount,
  getUserById,
  searchUsersByQuery,
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

export default router;
