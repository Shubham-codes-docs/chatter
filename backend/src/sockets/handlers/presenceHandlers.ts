import { Server, Socket } from "socket.io";
import redis from "../../config/redis.js";

export const registerPresenceHandlers = async (io: Server, socket: Socket) => {
  const userId = socket.data.userId;

  await redis.set(`user:${userId}:status`, "online");
  io.emit("user_online", userId);

  socket.on("disconnect", async () => {
    await redis.set(`user:${userId}:status`, "offline");
    await redis.set(`user:${userId}:lastSeen`, new Date().toISOString());
    io.emit("user_offline", userId);
  });
};
