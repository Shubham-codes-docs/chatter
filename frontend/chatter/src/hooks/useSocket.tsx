import { useEffect } from 'react';
import { initializeSocket } from '../socket/socketClient';
import {
  registerConversationHandler,
  registerMessageHandlers,
  registerPresenceHandler,
  registerTypingeHandler,
} from '../socket/socketHandlers';
import { useAuthStore } from '../store/authStore';

export const useSocket = () => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!isAuthenticated || !accessToken) return;

    const socket = initializeSocket(accessToken);
    if (!socket) return;

    // register all handlers
    registerMessageHandlers(socket);
    registerPresenceHandler(socket);
    registerTypingeHandler(socket);
    registerConversationHandler(socket);

    // clean up socket
    return () => {
      socket.off();
    };
  }, [isAuthenticated]);
};
