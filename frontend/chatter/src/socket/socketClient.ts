import { io, Socket } from 'socket.io-client';
import { useChatStore } from '../store/chatStore';
import { SOCKET_EVENTS } from './events';
import { toast } from 'sonner';

const SOCKET_URL = 'http://localhost:5000';

let socket: Socket | null = null;

// initialize socket connection
export const initializeSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('reconnect', () => {
    // get current messages snapshot
    const { conversations, fetchConversations } = useChatStore.getState();

    // rejoin all conversations after reconnect
    conversations.forEach((conv) => {
      socket?.emit(SOCKET_EVENTS.JOIN_CONVERSATION, conv.id);
    });

    fetchConversations();
  });

  socket.on('reconnect_error', (error) => {
    console.error('Socket reconnection error:', error);
  });

  socket.on('reconnect_failed', () => {
    console.error('Socket reconnection failed after all attempts');
    // notify user
    toast.error('Connection lost. Please refresh the page.');
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disConnectSocket = (): void => {
  if (socket) {
    socket?.disconnect();
    socket = null;
  }
};
