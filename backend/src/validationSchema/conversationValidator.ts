import { body } from "express-validator";

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
