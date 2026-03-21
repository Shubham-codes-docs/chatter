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
      console.log("inside mark_read");
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

      socket.to(parsed.data.conversationId).emit("message_read", {
        userId,
        conversationId: parsed.data.conversationId,
        lastReadAt: new Date(),
      });
      callback({ success: true });
    }),
  );

  socket.on(
    "message_delivered",
    socketHandler(async (payload: unknown, callback: AckCallBack) => {
      console.log("message_delivered handler called with:", payload);
      const parsed = await messageDeliveredSchema.safeParse(payload);
      console.log("parsed result:", parsed);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);

      const { messageId, conversationId, userId: recipientId } = parsed.data;

      await prisma.messageDelivery.upsert({
        where: {
          messageId_userId: {
            messageId,
            userId: recipientId,
          },
        },
        update: {},
        create: {
          messageId,
          userId: recipientId,
        },
      });

      socket.to(conversationId).emit("message_delivered", {
        messageId,
        conversationId,
        userId: recipientId,
      });
      callback({ success: true });
    }),
  );
};
