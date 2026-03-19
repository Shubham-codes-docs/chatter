import { SOCKET_EVENTS } from './events';
import { useChatStore } from '../store/chatStore';
import type { Message } from '../types/api.types';
import type { Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

interface typingHandlersInterface {
  userId: string;
  conversationId: string;
}

// receive messages sent by others in a conversation
export const registerMessageHandlers = (socket: Socket) => {
  socket.on(SOCKET_EVENTS.MESSAGE_RECEIVED, (message: Message) => {
    useChatStore.getState().addMessage(message);

    // notify the server that the message was delivered
    socket.emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
      messageId: message.id,
      conversationId: message.conversationId,
    });
  });

  // message updated by someone in the conversation
  socket.on(SOCKET_EVENTS.MESSAGE_UPDATED, (message: Message) => {
    useChatStore.getState().updateMessage(message);
  });

  // message deleted by someone in the conversation
  socket.on(
    SOCKET_EVENTS.MESSAGE_DELETED,
    (messageId: string, conversationId: string) => {
      useChatStore.getState().deleteMessage(messageId, conversationId);
    }
  );

  // message delivered to recipient
  socket.on(
    SOCKET_EVENTS.MESSAGE_DELIVERED,
    (messageId: string, _: string, conversationId: string) => {
      useChatStore.setState((state) => ({
        messages: {
          ...state.messages,
          [conversationId]:
            state.messages[conversationId]?.map((msg) =>
              msg.id === messageId
                ? { ...msg, status: 'delivered' as const }
                : msg
            ) || [],
        },
      }));
    }
  );

  // message read by recipient
  socket.on(
    SOCKET_EVENTS.MESSAGE_READ,
    (_: string, userId: string, conversationId: string) => {
      const { user } = useAuthStore.getState();

      // only update if we are the sender of the message
      useChatStore.setState((state) => ({
        messages: {
          ...state.messages,
          [conversationId]:
            state.messages[conversationId]?.map((msg) =>
              msg.senderId === user?.id && msg.senderId !== userId
                ? { ...msg, status: 'read' as const }
                : msg
            ) || [],
        },
      }));
    }
  );
};

// manage the presence status of the user
export const registerPresenceHandler = (socket: Socket) => {
  // mark user as online
  socket.on(SOCKET_EVENTS.USER_ONLINE, (userId) => {
    useChatStore.getState().setUserOnline(userId);
  });

  // mark user as offline
  socket.on(SOCKET_EVENTS.USER_OFFLINE, (userId) => {
    useChatStore.getState().setUserOffline(userId);
  });
};

// manage the presence status of the user
export const registerTypingeHandler = (socket: Socket) => {
  // mark user as typing
  socket.on(
    SOCKET_EVENTS.USER_TYPING,
    ({ userId, conversationId }: typingHandlersInterface) => {
      useChatStore.getState().setUserTyping(userId, conversationId);
    }
  );

  // mark user as typing stopped
  socket.on(
    SOCKET_EVENTS.USER_STOPPED_TYPING,
    ({ userId, conversationId }: typingHandlersInterface) => {
      useChatStore.getState().setUserStoppedTyping(userId, conversationId);
    }
  );
};
