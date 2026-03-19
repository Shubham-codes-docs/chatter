import { useEffect } from 'react';
import { initializeSocket } from '../socket/socketClient';
import {
  registerMessageHandlers,
  registerPresenceHandler,
  registerTypingeHandler,
} from '../socket/socketHandlers';
import { useAuthStore } from '../store/authStore';

export const useSocket = () => {
  const { isAuthenticated, accessToken } = useAuthStore.getState();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket = initializeSocket(accessToken);
    if (!socket) return;

    // register all handlers
    registerMessageHandlers(socket);
    registerPresenceHandler(socket);
    registerTypingeHandler(socket);

    // clean up socket
    return () => {
      socket.off();
    };
  }, [isAuthenticated, accessToken]);
};
