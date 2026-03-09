import { Router } from "express";
import {
  register,
  login,
  getCurrentUser,
} from "../controllers/authController.js";
import { authMiddleWare } from "../middleware/authMiddleWare.js";
import {
  loginValidation,
  registerValidation,
} from "../validationSchema/authValidator.js";
import { validateRequest } from "../middleware/validate.js";

const router = Router();

// public routes
router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);

// protected routes
router.get("/me", authMiddleWare, getCurrentUser);

export default router;
