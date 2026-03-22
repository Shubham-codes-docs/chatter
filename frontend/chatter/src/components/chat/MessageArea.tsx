import { useEffect, useRef } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import ChatBubble from './ChatBubble';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { getSocket } from '../../socket/socketClient';
import { SOCKET_EVENTS } from '../../socket/events';
import { getTypersName } from '../../utils/conversationUtils';

const MessageArea = () => {
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

  const typingConversations = (
    typingUsers[activeConversationId ?? ''] || []
  ).filter((t) => t.userId !== user?.id);

  useEffect(() => {
    if (!activeConversationId) return;
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

  // scroll to bottom of the page
  const messagesToBeScrolled = messages[activeConversationId!] ?? '';
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesToBeScrolled]);

  if (!activeConversationId) return;

  const conversationMessages = messages[activeConversationId!] ?? [];
  const hasMore =
    cursors[activeConversationId!] !== null &&
    cursors[activeConversationId!] !== undefined;

  return (
    <ScrollArea className="p-6 flex-1 overflow-y-auto">
      {hasMore && (
        <div className="flex justify-center mb-4">
          <button
            className="btn btn-ghost small-regular"
            onClick={() =>
              fetchMessages(
                activeConversationId,
                cursors[activeConversationId] ?? undefined
              )
            }
            disabled={isLoadingMessages}
          >
            {isLoadingMessages ? 'Loading...' : 'Load older messages'}
          </button>
        </div>
      )}
      {conversationMessages.map((message) => (
        <ChatBubble
          key={message.id}
          message={message}
          isSent={message.senderId === user?.id}
        />
      ))}
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
      <div ref={bottomRef} />
    </ScrollArea>
  );
};

export default MessageArea;
