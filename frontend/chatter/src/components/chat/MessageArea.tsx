import { useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { getSocket } from '../../socket/socketClient';
import { SOCKET_EVENTS } from '../../socket/events';
import { getTypersName } from '../../utils/conversationUtils';
import type { Message } from '../../types/api.types';
import MessageSkeleton from '../common/MessageSkeleton';
import EmptyState from '../EmptyState';

interface MessageAreaInterface {
  onReply: (message: Message | null) => void;
  onEdit?: (message: Message | null) => void;
}

const MessageArea = ({ onReply, onEdit }: MessageAreaInterface) => {
  const {
    activeConversationId,
    messages,
    fetchMessages,
    markConversationAsRead,
    cursors,
    isLoadingMessages,
    typingUsers,
    conversations,
  } = useChatStore();
  const { user } = useAuthStore();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const prevMessageCountRef = useRef<number>(0);
  const isLoadingOlderRef = useRef(false);
  const isInitialLoadRef = useRef(true);

  const typingConversations = (
    typingUsers[activeConversationId ?? ''] || []
  ).filter((t) => t.userId !== user?.id);

  useEffect(() => {
    if (!activeConversationId) return;
    prevMessageCountRef.current = 0;
    isInitialLoadRef.current = true;
    fetchMessages(activeConversationId);

    const socket = getSocket();

    if (!socket) return;

    // join socket conversation
    socket.emit(SOCKET_EVENTS.JOIN_CONVERSATION, activeConversationId);

    // mark all messages as read
    socket.emit(SOCKET_EVENTS.MARK_READ, {
      conversationId: activeConversationId,
    });

    // update the last read of the user locally
    markConversationAsRead(activeConversationId, user?.id ?? '');

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, activeConversationId);
    };
    // eslint-disable-next-line
  }, [activeConversationId]);

  useEffect(() => {
    const currentMessages = messages[activeConversationId!] ?? [];
    const prevCount = prevMessageCountRef.current;
    const currentCount = currentMessages.length;

    // only scroll to bottom if a new message was added at the bottom
    // not when older messages were prepended at the top
    if (currentCount > prevCount) {
      if (isInitialLoadRef.current) {
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'instant' });
        });
        isInitialLoadRef.current = false;
      } else if (!isLoadingOlderRef.current) {
        const lastMessage = currentMessages[currentCount - 1];
        const secondLastMessage = currentMessages[prevCount - 1];
        // if the last message changed — new message added at bottom
        if (lastMessage?.id !== secondLastMessage?.id) {
          requestAnimationFrame(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
          });
        }
      }
    }
    prevMessageCountRef.current = currentCount;
  }, [messages, activeConversationId]);

  const conversationMessages = messages[activeConversationId!] ?? [];
  const isInitialLoading =
    isLoadingMessages && conversationMessages.length === 0;
  const hasMore =
    cursors[activeConversationId!] !== null &&
    cursors[activeConversationId!] !== undefined;

  // effect to trigger infinite scroll if more messages are present
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const scrollContainer = scrollAreaRef.current;
    if (!sentinel || !activeConversationId || !scrollContainer) return;

    // setting up intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !isLoadingMessages) {
          // store the position of the scroll height before loading
          prevScrollHeightRef.current = scrollContainer.scrollHeight;
          isLoadingOlderRef.current = true;
          fetchMessages(
            activeConversationId,
            cursors[activeConversationId] ?? undefined
          ).then(() => {
            // restore the scroll height
            const newScrollHeight = scrollContainer.scrollHeight;
            scrollContainer.scrollTop =
              newScrollHeight - prevScrollHeightRef.current;
            isLoadingOlderRef.current = false;
          });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
    // eslint-disable-next-line
  }, [activeConversationId, isLoadingMessages, cursors, hasMore]);

  if (!activeConversationId) return;
  return (
    <div className="p-6 flex-1 overflow-y-auto" ref={scrollAreaRef}>
      <div ref={sentinelRef} className="h-1" />
      {isLoadingMessages && (
        <div className="flex justify-center py-2">
          <div className="spinner" />
        </div>
      )}
      {isInitialLoading ? (
        <>
          <MessageSkeleton isSent={false} />
          <MessageSkeleton isSent={true} />
          <MessageSkeleton isSent={false} />
          <MessageSkeleton isSent={true} />
          <MessageSkeleton isSent={false} />
          <MessageSkeleton isSent={true} />
        </>
      ) : (
        conversationMessages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message}
            isSent={message.senderId === user?.id}
            onReply={onReply}
            onEdit={onEdit}
          />
        ))
      )}
      {typingConversations.length > 0 && (
        <div className="flex items-center gap-2 px-2 py-1 mb-2">
          <div className="avatar avatar-sm">
            {getTypersName(
              typingConversations[0].userId,
              activeConversationId,
              conversations
            ).charAt(0)}
          </div>
          <div className="flex items-center gap-1 bg-surface border border-default rounded-full px-3 py-2">
            <span
              className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <span
              className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
          <span className="tiny-regular text-secondary">
            {typingConversations.length === 1
              ? `${getTypersName(typingConversations[0].userId, activeConversationId, conversations)} is typing...`
              : `${typingConversations.length} people are typing...`}
          </span>
        </div>
      )}
      {!isInitialLoading && conversationMessages.length === 0 && (
        <EmptyState
          icon="👋"
          title="No messages yet"
          description="Say hello and start the conversation"
        />
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageArea;
