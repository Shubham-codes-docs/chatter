import { Server, Socket } from "socket.io";
import redis from "../../config/redis.js";

export const registerTypingHandlers = (_: Server, socket: Socket) => {
  socket.on("typing_start", async (conversationId) => {
    await redis.setex(`typing:${conversationId}:${socket.data.userId}`, 5, "1");
    socket
      .to(conversationId)
      .emit("user_typing", { userId: socket.data.userId, conversationId });
  });

  socket.on("typing_stop", async (conversationId) => {
    await redis.del(`typing:${conversationId}:${socket.data.userId}`);
    socket.to(conversationId).emit("user_stopped_typing", {
      userId: socket.data.userId,
      conversationId,
    });
  });
};
