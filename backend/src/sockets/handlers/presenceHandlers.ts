import { Server, Socket } from "socket.io";
import redis from "../../config/redis.js";
import prisma from "../../config/db.js";

export const registerPresenceHandlers = async (io: Server, socket: Socket) => {
  const userId = socket.data.userId;

  await redis.set(`user:${userId}:status`, "online");
  io.emit("user_online", userId);

  // mark all the messages received by the user as delivered
  const conversations = await prisma.conversationParticipant.findMany({
    where: {
      userId,
    },
    select: {
      conversationId: true,
    },
  });

  for (const { conversationId } of conversations) {
    const undelivered = await prisma.message.findMany({
      where: {
        conversationId,
        senderId: { not: userId },
        deliveries: { none: { userId } },
      },
      select: {
        id: true,
      },
    });

    for (const msg of undelivered) {
      await prisma.messageDelivery.upsert({
        where: { messageId_userId: { messageId: msg.id, userId } },
        update: {},
        create: { messageId: msg.id, userId },
      });
    }
  }

  socket.on("disconnect", async () => {
    await redis.set(`user:${userId}:status`, "offline");
    await redis.set(`user:${userId}:lastSeen`, new Date().toISOString());
    io.emit("user_offline", userId);
  });
};
