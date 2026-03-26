import prisma from "../config/db.js";

export const getFullConversation = (conversationId: string) =>
  prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              avatar: true,
              status: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: {
        select: { messages: true },
      },
    },
  });
