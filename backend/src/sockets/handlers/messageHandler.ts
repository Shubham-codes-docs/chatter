import { Server, Socket } from "socket.io";
import prisma from "../../config/db.js";
import { socketHandler } from "../socketHandler.js";
import {
  markReadSchema,
  messageDeliveredSchema,
} from "../../validators/messageSocketValidator.js";

type AckCallBack = (response: { success: boolean; error?: string }) => void;

export const registerMessageHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.userId;

  socket.on(
    "mark_read",
    socketHandler(async (payload, callback: AckCallBack) => {
      console.log("inside mark_read");
      const parsed = await markReadSchema.safeParse(payload);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);

      console.log("mark_read received for:", parsed.data.conversationId);
      console.log("userId:", userId);

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

      console.log("about to emit message_read");
      console.log("emitting message_read to room:", parsed.data.conversationId);
      console.log(
        "sockets in room:",
        await io
          .in(parsed.data.conversationId)
          .fetchSockets()
          .then((s) => s.map((s) => s.data.userId)),
      );
      socket.to(parsed.data.conversationId).emit("message_read", {
        userId,
        conversationId: parsed.data.conversationId,
        lastReadAt: new Date(),
      });
      console.log("message_read emitted");
      callback({ success: true });
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
        messageId,
        conversationId,
      });
      callback({ success: true });
    }),
  );
};
