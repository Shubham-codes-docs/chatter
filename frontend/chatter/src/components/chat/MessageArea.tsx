import { useEffect, useRef } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import ChatBubble from './ChatBubble';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { getSocket } from '../../socket/socketClient';
import { SOCKET_EVENTS } from '../../socket/events';

const MessageArea = () => {
  const {
    activeConversationId,
    messages,
    fetchMessages,
    cursors,
    isLoadingMessages,
  } = useChatStore();
  const { user } = useAuthStore();
  const bottomRef = useRef<HTMLDivElement | null>(null);

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

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, activeConversationId);
    };
  }, [activeConversationId, fetchMessages]);

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
      <div ref={bottomRef} />
    </ScrollArea>
  );
};

export default MessageArea;
