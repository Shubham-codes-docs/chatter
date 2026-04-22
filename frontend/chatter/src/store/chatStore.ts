import { create } from 'zustand';
import { toast } from 'sonner';
import type {
  BlockedUser,
  Conversation,
  Message,
  Reaction,
  TypingIndicator,
} from '../types/api.types';
import api, { apiRequest } from '../services/api';
import { handleApiError } from '../utils/errorHandler';
import { useAuthStore } from './authStore';
import { userService } from '../services/userService';
import { playMessageSound } from '../utils/soundUtils';
interface ChatStoreInterface {
  // conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  unreadCounts: Record<string, number>;

  // messages per conversation
  messages: Record<string, Message[]>;

  // pagination cursors per conversation
  cursors: Record<string, string | null>;

  // loading states
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;

  // typing indicators
  typingUsers: Record<string, TypingIndicator[]>;

  // online users
  onlineUsers: string[];

  // blocked users
  blockedUserIds: string[];

  // conversation actions
  fetchConversations: () => Promise<void>;
  setActiveConversationId: (conversationId: string) => void;
  addConversation: (conversation: Conversation) => void;

  // message actions
  fetchMessages: (conversationId: string, cursor?: string) => Promise<void>;
  sendMessage: (
    conversationId: string,
    content: string,
    type?: string,
    replyToId?: string,
    fileUrl?: string,
    fileName?: string,
    fileSize?: number
  ) => Promise<void>;
  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  editMessage: (
    messageId: string,
    conversationId: string,
    content: string
  ) => void;
  deleteMessage: (messageId: string, conversationId: string) => void;
  deleteMessageApi: (
    messageId: string,
    conversationId: string,
    deletedFor: 'everyone' | 'me'
  ) => void;
  markConversationAsRead: (conversationId: string, userId: string) => void;
  reactToMessage: (
    conversationID: string,
    messageId: string,
    reaction: Reaction
  ) => void;

  // presence actions
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;

  // typing actions
  setUserTyping: (userId: string, conversationId: string) => void;
  setUserStoppedTyping: (userId: string, conversationId: string) => void;

  // block actions
  setBlockedUserIds: (id: string[]) => void;
}

export const useChatStore = create<ChatStoreInterface>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  cursors: {},
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  typingUsers: {},
  onlineUsers: [],
  unreadCounts: {},
  blockedUserIds: [],

  // get conversations
  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const { data: conversations } = await apiRequest<Conversation[]>(
        api.get('/conversations')
      );
      const { data: onlineStatus } = await apiRequest<
        { userId: string; isOnline: boolean }[]
      >(api.get('/users/online-status'));

      // build online userIds
      const onlineUserIds = onlineStatus
        .filter((o) => o.isOnline)
        .map((p) => p.userId);

      // calculate unread counts
      const unReadCounts: Record<string, number> = {};
      conversations.forEach((conversation) => {
        unReadCounts[conversation.id] = conversation.unReadCount;
      });

      set({
        conversations,
        onlineUsers: onlineUserIds,
        unreadCounts: unReadCounts,
      });

      const blocked = await userService.getBlockedUsers();
      set({ blockedUserIds: blocked.map((b: BlockedUser) => b.blockedId) });
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      set({ isLoadingConversations: false });
    }
  },
  // set active conversationId
  setActiveConversationId: (conversationId) => {
    set((state) => ({
      activeConversationId: conversationId,
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: 0,
      },
    }));
  },

  // add conversations created by others
  addConversation: async (conversation) => {
    set((state) => {
      const isExisting = state.conversations.some(
        (c) => c.id === conversation.id
      );
      if (isExisting) return state;

      return {
        conversations: [conversation, ...state.conversations],
        unreadCounts: {
          ...state.unreadCounts,
          [conversation.id]: conversation.unReadCount ?? 0,
        },
      };
    });
  },

  // fetch messages of a conversation
  fetchMessages: async (conversationId, cursor) => {
    set({ isLoadingMessages: true });
    try {
      const { data } = await apiRequest<{
        messages: Message[];
        nextCursor: string | null;
      }>(api.get(`/messages/${conversationId}`, { params: { cursor } }));
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: cursor
            ? [
                ...data.messages.reverse(),
                ...(state.messages[conversationId] || []),
              ]
            : data.messages.reverse(),
        },
        cursors: {
          ...state.cursors,
          [conversationId]: data.nextCursor,
        },
      }));
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  // add a blocked user to the array
  setBlockedUserIds: (ids) => {
    set({ blockedUserIds: ids });
  },

  // send message
  sendMessage: async (
    conversationId,
    content,
    type = 'text',
    replyToId,
    fileUrl,
    fileName,
    fileSize
  ) => {
    const { blockedUserIds } = useChatStore.getState();

    const tempId = crypto.randomUUID();
    const { user } = useAuthStore.getState();

    const { messages } = useChatStore.getState();

    const otherParticipant = useChatStore
      .getState()
      .conversations.find((c) => c.id === conversationId)
      ?.participants.find((p) => p.userId !== user?.id);

    if (otherParticipant && blockedUserIds.includes(otherParticipant.userId)) {
      toast.error('You have blocked this user');
      return;
    }

    const replyToMessage = replyToId
      ? (messages[conversationId]?.find((m) => m.id === replyToId) ?? null)
      : null;

    // create an optimistic message for immediate ui update
    const optimisticMessage: Message = {
      id: tempId,
      tempId,
      content,
      conversationId,
      type: type as Message['type'],
      senderId: user!.id,
      replyToId: replyToId || null,
      replyTo: replyToMessage,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileSize: fileSize || null,
      editedAt: null,
      deletedAt: null,
      reactions: [],
      sender: {
        id: user!.id,
        username: user!.username,
        fullName: user!.fullName,
        avatar: user!.avatar,
      },
      status: 'pending',
      deliveries: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // add optimistic message to the ui on creation
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [
          ...(state.messages[conversationId] || []),
          optimisticMessage,
        ],
      },
      isSendingMessage: true,
    }));
    try {
      const { data: newMessage } = await apiRequest<Message>(
        api.post('/messages', {
          conversationId,
          content,
          type,
          tempId,
          replyToId,
          fileUrl,
          fileName,
          fileSize,
        })
      );

      // now we replace the optimistic messsage with the real message received from the db
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId].map((msg) =>
            msg.id === tempId ? { ...newMessage, status: 'sent' } : msg
          ),
        },
        conversations: state.conversations
          .map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [newMessage],
                  updatedAt: newMessage.createdAt,
                }
              : conv
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          ),
        isSendingMessage: false,
      }));
    } catch (error) {
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId].map((msg) =>
            msg.id === tempId ? { ...msg, status: 'failed' } : msg
          ),
        },
        isSendingMessage: false,
      }));
      toast.error(handleApiError(error));
    }
  },

  // when another user messages the socket fires this
  addMessage: (message) => {
    const { user } = useAuthStore.getState();

    if (message.senderId !== user?.id) {
      playMessageSound();
    }

    set((state) => ({
      messages: {
        ...state.messages,
        [message.conversationId]: [
          ...(state.messages[message.conversationId] || []),
          message,
        ],
      },
      conversations: state.conversations
        .map((conv) =>
          conv.id === message.conversationId
            ? { ...conv, messages: [message], updatedAt: message.createdAt }
            : conv
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ),
      // update unread counts
      unreadCounts: {
        ...state.unreadCounts,
        [message.conversationId]:
          message.conversationId === state.activeConversationId
            ? 0
            : (state.unreadCounts[message.conversationId] || 0) + 1,
      },
    }));
  },
  // update message to be fired by socket
  updateMessage: (message) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [message.conversationId]: state.messages[message.conversationId].map(
          (msg) => {
            return msg.id === message.id ? message : msg;
          }
        ),
      },
    }));
  },
  // edit message in the backend
  editMessage: async (messageId, conversationId, content) => {
    try {
      await apiRequest<Message>(api.put(`/messages/${messageId}`, { content }));
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId].map((msg) =>
            msg.id === messageId
              ? { ...msg, content, editedAt: new Date().toISOString() }
              : msg
          ),
        },
      }));
    } catch (error) {
      toast.error(handleApiError(error));
    }
  },
  // delete message to be fired by socket
  deleteMessage: (messageId, conversationId) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: state.messages[conversationId].map((msg) => {
          return msg.id === messageId
            ? {
                ...msg,
                deletedAt: new Date().toISOString(),
                content: 'This message was deleted',
              }
            : msg;
        }),
      },
    }));
  },
  deleteMessageApi: async (messageId, conversationId, deletedFor) => {
    try {
      await apiRequest<Message>(
        api.delete(`/messages/${messageId}`, {
          data: { messageDeletedFor: deletedFor },
        })
      );
      if (deletedFor === 'everyone') {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: state.messages[conversationId].map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    content: 'This message was deleted',
                    deletedAt: new Date().toISOString(),
                  }
                : msg
            ),
          },
        }));
      } else {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: state.messages[conversationId].filter(
              (msg) => msg.id !== messageId
            ),
          },
        }));
      }
    } catch (error) {
      toast.error(handleApiError(error));
    }
  },

  // react to message
  reactToMessage: (conversationId, messageId, reaction) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]:
          state.messages[conversationId].map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  reactions: (msg.reactions ?? []).some(
                    (reac) => reac.userId === reaction.userId
                  )
                    ? (msg.reactions ?? []).map((r) =>
                        r.userId === reaction.userId ? reaction : r
                      )
                    : [...(msg.reactions ?? []), reaction],
                }
              : msg
          ) ?? [],
      },
    }));
  },
  // mark conversation as read
  markConversationAsRead: (conversationId, userId) => {
    set((state) => ({
      conversations: state.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              participants: conversation.participants.map((p) =>
                p.id === userId
                  ? { ...p, lastReadAt: new Date().toISOString() }
                  : p
              ),
            }
          : conversation
      ),
    }));
  },

  // set user to online
  setUserOnline: (userId) => {
    set((state) => ({
      onlineUsers: state.onlineUsers.includes(userId)
        ? state.onlineUsers
        : [...state.onlineUsers, userId],
      conversations: state.conversations.map((conversation: Conversation) => ({
        ...conversation,
        participants: conversation.participants.map((p) =>
          p.userId === userId
            ? {
                ...p,
                user: { ...p.user, status: 'online' as const },
              }
            : p
        ),
      })),
    }));
  },
  // set user to offline
  setUserOffline: (userId) => {
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((id: string) => id !== userId),
      conversations: state.conversations.map((conversation: Conversation) => ({
        ...conversation,
        participants: conversation.participants.map((p) =>
          p.userId === userId
            ? {
                ...p,
                user: { ...p.user, status: 'offline' as const },
              }
            : p
        ),
      })),
    }));
  },

  // set typing of user
  setUserTyping: (userId, conversationId) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: [
          ...(state.typingUsers[conversationId] || []).filter(
            (t) => t.userId !== userId
          ),
          { userId, conversationId },
        ],
      },
    }));
  },
  // stop typing of user
  setUserStoppedTyping: (userId, conversationId) => {
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [conversationId]: [
          ...(state.typingUsers[conversationId] || []).filter(
            (t) => t.userId !== userId
          ),
        ],
      },
    }));
  },
}));
