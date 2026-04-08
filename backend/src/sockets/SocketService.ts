import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { verifyAccessToken } from "../utils/jwt.js";
import { registerPresenceHandlers } from "./handlers/presenceHandlers.js";
import { registerConversationHandlers } from "./handlers/conversationHandler.js";
import { registerMessageHandlers } from "./handlers/messageHandler.js";
import { registerTypingHandlers } from "./handlers/typingHandlers.js";
import { UnauthorizedError } from "../utils/customErrors.js";
import { registerCallHandler } from "./handlers/callHandler.js";

export const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.1.100:5173",
      ],
      credentials: true,
    },
  });

  // verify token
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth["token"];
      if (!token) {
        return next(new Error("No token provided"));
      }
      const decoded = verifyAccessToken(token);
      if (!decoded) return next(new Error("No token provided"));

      socket.data.userId = decoded.userId;
      next();
    } catch (error) {
      next(
        new UnauthorizedError("Invalid or expired token for socket connection"),
      );
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.userId;
    console.log("The user id is ", userId);
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined personal room user:${userId}`);

    registerPresenceHandlers(io, socket);
    registerConversationHandlers(io, socket);
    registerTypingHandlers(io, socket);
    registerMessageHandlers(io, socket);
    registerCallHandler(io, socket);
  });

  return io;
};
