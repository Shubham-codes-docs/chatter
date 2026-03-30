import { Server, Socket } from "socket.io";
import redis from "../../config/redis.js";
import prisma from "../../config/db.js";

export const registerPresenceHandlers = async (io: Server, socket: Socket) => {
  const userId = socket.data.userId;

  await redis.set(`user:${userId}:status`, "online");

  // sync the db with the cache
  await prisma.user.update({
    where: { id: userId },
    data: { status: "online", lastSeen: new Date() },
  });

  // auto join all the rooms for the user
  const userConversations = await prisma.conversationParticipant.findMany({
    where: {
      userId,
    },
    select: {
      conversationId: true,
    },
  });

  for (const { conversationId } of userConversations) {
    socket.join(conversationId);
  }

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
      // update all the conversations that their messages are read
      const message = await prisma.message.findUnique({
        where: {
          id: msg.id,
        },
        select: {
          conversationId: true,
        },
      });

      if (message)
        socket.to(conversationId).emit("message_delivered", {
          messageId: msg.id,
          conversationId,
          userId,
        });
    }
  }

  socket.on("disconnect", async () => {
    await redis.set(`user:${userId}:status`, "offline");
    await redis.set(`user:${userId}:lastSeen`, new Date().toISOString());
    await prisma.user.update({
      where: { id: userId },
      data: { status: "offline", lastSeen: new Date() },
    });
    io.emit("user_offline", userId);

    // clear all redis keys for the user
    const keys = await redis.keys(`typing:*:${userId}`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }

    // emit stopped typing for all conversations
    const conversations = await prisma.conversationParticipant.findMany({
      where: { userId },
      select: { conversationId: true },
    });

    for (const { conversationId } of conversations) {
      socket.to(conversationId).emit("user_stopped_typing", {
        userId,
        conversationId,
      });
    }

    // handle all active calls on disconnect
    const activeCalls = await prisma.call.findMany({
      where: {
        status: "ongoing",
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    for (const call of activeCalls) {
      const duration = (Date.now() - call.startedAt.getTime()) / 1000;

      await prisma.call.update({
        where: { id: call.id },
        data: { status: "ended", endedAt: new Date(), duration },
      });

      // notify other participants that the call has ended
      const otherParticipants = call.participants.filter(
        (p) => p.userId !== userId,
      );

      for (const participant of otherParticipants) {
        io.to(`user:${participant.userId}`).emit("call_ended", {
          callId: call.id,
          reason: "disconnected",
        });
      }
    }
  });
};
