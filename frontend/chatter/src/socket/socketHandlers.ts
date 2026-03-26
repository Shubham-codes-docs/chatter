import { SOCKET_EVENTS } from './events';
import { useChatStore } from '../store/chatStore';
import type { Conversation, Message } from '../types/api.types';
import type { Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

interface typingHandlersInterface {
  userId: string;
  conversationId: string;
}

// receive messages sent by others in a conversation
export const registerMessageHandlers = (socket: Socket) => {
  socket.on(SOCKET_EVENTS.MESSAGE_RECEIVED, (message: Message) => {
    const { user } = useAuthStore.getState();
    const { activeConversationId } = useChatStore.getState();

    if (message.senderId === user?.id) {
      // just update the optimistic message status instead
      useChatStore.setState((state) => {
        const conversationMessages =
          state.messages[message.conversationId] || [];
        const hasRealMessage = conversationMessages.some(
          (m) => m.id === message.id
        );
        if (hasRealMessage) return state;

        const hasTempMessage = conversationMessages.some(
          (m) => m.tempId === message.tempId
        );
        return {
          messages: {
            ...state.messages,
            [message.conversationId]: hasTempMessage
              ? conversationMessages.map((msg) =>
                  msg.tempId === message.tempId
                    ? { ...message, status: 'sent' as const }
                    : msg
                )
              : [
                  ...conversationMessages,
                  { ...message, status: 'sent' as const },
                ],
          },
        };
      });
      return;
    }

    useChatStore.getState().addMessage(message);

    // notify the server that the message was delivered
    socket.emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
      messageId: message.id,
      conversationId: message.conversationId,
      userId: user?.id,
    });

    // if it is the active conversation emit mark read
    if (activeConversationId === message.conversationId) {
      socket.emit(SOCKET_EVENTS.MARK_READ, {
        conversationId: activeConversationId,
      });
    }
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
    ({
      messageId,
      conversationId,
      userId: recipientId,
    }: {
      messageId: string;
      conversationId: string;
      userId: string;
    }) => {
      useChatStore.setState((state) => ({
        messages: {
          ...state.messages,
          [conversationId]:
            state.messages[conversationId]?.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    status: 'delivered' as const,
                    deliveries: [
                      ...(msg.deliveries || []),
                      {
                        userId: recipientId,
                        deliveredAt: new Date().toISOString(),
                      },
                    ],
                  }
                : msg
            ) || [],
        },
      }));
    }
  );

  // message read by recipient
  socket.on(
    SOCKET_EVENTS.MESSAGE_READ,
    ({
      userId,
      conversationId,
    }: {
      userId: string;
      conversationId: string;
    }) => {
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
        conversations: state.conversations.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                participants: conversation.participants.map((p) =>
                  p.userId === userId
                    ? { ...p, lastReadAt: new Date().toISOString() }
                    : p
                ),
              }
            : conversation
        ),
      }));
    }
  );
};

// manage the creation of a new conversation
export const registerConversationHandler = (socket: Socket) => {
  // someone creates a new conversation with the user
  socket.on(
    SOCKET_EVENTS.CONVERSATION_CREATED,
    (conversation: Conversation) => {
      useChatStore.getState().addConversation(conversation);
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
