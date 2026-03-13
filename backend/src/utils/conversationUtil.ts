import prisma from "../config/db.js";
import { UnauthorizedError } from "./customErrors.js";

export const verifyConversationParticipant = async (
  conversationId: string,
  userId: string,
): Promise<void> => {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });

  if (!participant)
    throw new UnauthorizedError("You are not part of this conversation");
};
