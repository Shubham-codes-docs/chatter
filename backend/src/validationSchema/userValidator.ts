import { body, query } from "express-validator";

export const updateUserProfileValidation = [
  body("fullName")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Full Name can not be empty"),
  body("username")
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters"),
  body("bio")
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage("Bio can not be more than 200 characters"),
];

export const updatePasswordValidation = [
  body("currentPassword").notEmpty().isString(),
  body("newPassword")
    .isString()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Must contain uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Must contain lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Must contain number")
    .matches(/[@$!%*?&]/)
    .withMessage("Must contain special character"),
];

export const searchUserValidation = [
  query("q")
    .notEmpty()
    .withMessage("Search query can not be empty")
    .isLength({ min: 2 })
    .withMessage("Search query must be at least 2 characters"),
];

export const deleteUserValidation = [
  body("email").notEmpty().withMessage("Email can not be empty"),
];
