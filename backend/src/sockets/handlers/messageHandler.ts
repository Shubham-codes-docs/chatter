import { Server, Socket } from "socket.io";
import prisma from "../../config/db.js";
import { socketHandler } from "../socketHandler.js";
import {
  markReadSchema,
  messageDeliveredSchema,
} from "../../validators/messageSocketValidator.js";

type AckCallBack = (response: { success: boolean; error?: string }) => void;

export const registerMessageHandlers = (_: Server, socket: Socket) => {
  const userId = socket.data.userId;

  socket.on(
    "mark_read",
    socketHandler(async (payload, callback: AckCallBack) => {
      const parsed = await markReadSchema.safeParse(payload);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);

      await prisma.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId: parsed.data.conversationId,
            userId: userId,
          },
        },
        data: {
          lastReadAt: new Date(),
        },
      });

      callback({ success: true });
      socket.to(parsed.data.conversationId).emit("message_read", {
        userId,
        conversationId: parsed.data.conversationId,
        lastReadAt: new Date(),
      });
    }),
  );

  socket.on(
    "message_delivered",
    socketHandler(async (payload: unknown, callback: AckCallBack) => {
      const parsed = await messageDeliveredSchema.safeParse(payload);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);

      const { messageId, conversationId } = parsed.data;

      await prisma.messageDelivery.upsert({
        where: {
          messageId_userId: {
            messageId,
            userId,
          },
        },
        update: {},
        create: {
          messageId,
          userId,
        },
      });

      socket.to(conversationId).emit("message_delivered", {
        userId,
        messageId,
      });
      callback({ success: true });
    }),
  );
};
