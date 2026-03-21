import { Server, Socket } from "socket.io";

export const registerConversationHandlers = (_: Server, socket: Socket) => {
  socket.on("join_conversation", (conversationId: string) => {
    socket.join(conversationId);
  });

  socket.on("leave_connection", (conversationId: string) => {
    socket.leave(conversationId);
  });
};
