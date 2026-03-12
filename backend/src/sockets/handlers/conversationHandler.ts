import { Server, Socket } from "socket.io";

export const registerConversationHandlers = (_: Server, socket: Socket) => {
  socket.on("join_conversation", (conversationId: string) => {
    socket.join(conversationId);
    console.log(`User ${socket.data.userId} joined room ${conversationId}`);
  });

  socket.on("leave_connection", (conversationId: string) => {
    socket.leave(conversationId);
    console.log(`User ${socket.data.userId} left room ${conversationId}`);
  });
};
