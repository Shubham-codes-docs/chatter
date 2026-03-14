import { body, param } from "express-validator";

export const validateCreateConversation = [
  body("type")
    .notEmpty()
    .trim()
    .isIn(["direct", "group"])
    .withMessage("Type should be direct or message"),
  body("participantsId").isArray({ min: 1 }),
  body("name")
    .if(body("type").equals("group"))
    .notEmpty()
    .withMessage("Group Name is required"),
];

export const validateAddParticipants = [
  body("conversationParticipants")
    .isArray({ min: 1 })
    .withMessage("At least one participant is required"),
  param("id").notEmpty().withMessage("Conversation Id is required"),
];

export const validateRemoveParticipant = [
  param("userId").notEmpty().withMessage("Target user ID is required"),
  param("id").notEmpty().withMessage("Conversation Id is required"),
];

export const validateUpdateParticipantRole = [
  body("role")
    .notEmpty()
    .isIn(["admin", "member"])
    .withMessage("Role must be admin or member"),
  param("userId").notEmpty().withMessage("Target user ID is required"),
  param("id").notEmpty().withMessage("Conversation Id is required"),
];

export const validateUpdateGroupInfo = [
  body("name").optional().notEmpty().withMessage("Group name cannot be empty"),
  body("description").optional().isString(),
];
