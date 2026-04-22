import { useEffect } from 'react';
import { initializeSocket } from '../socket/socketClient';
import {
  registerCallHandler,
  registerConversationHandler,
  registerMessageHandlers,
  registerPresenceHandler,
  registerTypingeHandler,
} from '../socket/socketHandlers';
import { useAuthStore } from '../store/authStore';
import { requestNotificationPermission } from '../utils/desktopNotificationUtil';

export const useSocket = () => {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!isAuthenticated || !accessToken) return;

    const socket = initializeSocket(accessToken);
    if (!socket) return;

    // request permission for sending desktop notifications
    requestNotificationPermission();

    // register all handlers
    registerMessageHandlers(socket);
    registerPresenceHandler(socket);
    registerTypingeHandler(socket);
    registerConversationHandler(socket);
    registerCallHandler(socket);

    // clean up socket
    return () => {
      socket.off();
    };
  }, [isAuthenticated]);
};
