import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyAccessToken } from "../utils/jwt.js";
import { registerPresenceHandlers } from "./handlers/presenceHandlers.js";
import { registerConversationHandlers } from "./handlers/conversationHandler.js";

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env["CLIENT_URL"],
      credentials: true,
    },
  });

  // verify token
  io.use(async (socket, next) => {
    const token = socket.handshake.auth["token"];
    if (!token) {
      return next(new Error("No token provided"));
    }
    const decoded = verifyAccessToken(token);
    if (!decoded) return next(new Error("No token provided"));

    socket.data.userId = decoded.userId;
    next();
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.userId;
    console.log("The user id is ", userId);

    registerPresenceHandlers(io, socket);
    registerConversationHandlers(io, socket);
  });

  return io;
};
