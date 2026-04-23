import type { Message, MessageStatus } from '../../types/api.types';
import {
  BsCheck,
  BsCheckAll,
  BsClock,
  BsExclamationCircle,
  BsReply,
} from 'react-icons/bs';
import {
  getMessageDeliveryStatus,
  getMessageTime,
} from '../../utils/messageUtils';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { useSwipeToReply } from '../../hooks/useSwipeToReply';
import { useState } from 'react';
import { messageService } from '../../services/messageService';
import MessageContent from './MessageContent';
import ReplyPreviewContent from './ReplyPreviewContent';

interface ChatBubbleProps {
  message: Message;
  isSent: boolean;
  onReply: (message: Message) => void;
}

const REACTIONS = [
  { key: 1, emoji: '❤️' },
  { key: 2, emoji: '👍' },
  { key: 3, emoji: '😂' },
  { key: 4, emoji: '😮' },
  { key: 5, emoji: '😢' },
  { key: 6, emoji: '🙏' },
];

const StatusIcon = ({ status }: { status: MessageStatus | undefined }) => {
  switch (status) {
    case 'pending':
      return <BsClock className="w-3 h-3 text-white/70" />;
    case 'sent':
      return <BsCheck className="w-3 h-3 text-white/70" />;
    case 'delivered':
      return <BsCheckAll className="w-3 h-3 text-white/70" />;
    case 'read':
      return <BsCheckAll className="w-3 h-3 text-blue-400" />;
    case 'failed':
      return <BsExclamationCircle className="w-3 h-3 text-red-400" />;
    default:
      return <BsCheck className="w-3 h-3 text-white/70" />;
  }
};

const ChatBubble = ({ message, isSent, onReply }: ChatBubbleProps) => {
  const { conversations, activeConversationId } = useChatStore();
  const { user } = useAuthStore();
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const handleReact = async (emoji: string) => {
    await messageService.reactToMessage(message.id, emoji);
    setShowReactionPicker(false);
  };

  const groupMessageReactions = (message.reactions ?? []).reduce<
    Record<string, number>
  >((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {});

  const {
    swipeOffSet,
    isSwipping,
    isHovered,
    onTouchStart,
    onTouchEnd,
    onMouseEnter,
    onMouseLeave,
    onTouchMove,
  } = useSwipeToReply(message, onReply);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const status =
    isSent && activeConversation
      ? getMessageDeliveryStatus(
          message,
          user?.id ?? '',
          activeConversation?.participants
        )
      : message.status;

  return (
    <div
      className={`flex items-center mb-4 ${isSent ? 'justify-end' : 'justify-start'}`}
      style={{
        transform: `translateX(${swipeOffSet}px)`,
        transition: isSwipping ? 'none' : 'transform 0.2s ease-out',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {isSent ? (
        // ── SENT BUBBLE ──────────────────────────────────────────
        <div
          className="flex items-center gap-2"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          {/* reply button — left of sent bubble */}
          {isHovered && (
            <button
              className="btn-ghost p-1.5 rounded-lg text-muted hover:text-primary transition-colors duration-150 shrink-0"
              onClick={() => onReply(message)}
            >
              <BsReply size={16} />
            </button>
          )}

          {/* bubble content */}
          <div
            className="flex flex-col items-end min-w-[150px] max-w-[70vw] sm:max-w-[55vw] md:max-w-[45vw]"
            onMouseEnter={() => {
              setShowReactionPicker(true);
            }}
            onMouseLeave={() => {
              setShowReactionPicker(false);
            }}
          >
            {showReactionPicker && (
              <div className="flex items-center justify-center gap-3 mb-2">
                {REACTIONS.map((r) => (
                  <div
                    key={r.key}
                    className="text-lg hover:scale-125 transition-transform duration-150 cursor-pointer"
                    onClick={() => handleReact(r.emoji)}
                  >
                    <p>{r.emoji}</p>
                  </div>
                ))}
              </div>
            )}
            {/* reply preview */}
            {message.replyTo && (
              <div className="w-full bg-white/20 border-l-2 border-white/60 rounded-lg px-3 py-1.5 mb-1">
                <p className="text-white/80 tiny-semibold truncate">
                  {message.replyTo.sender.username}
                </p>
                <p className="text-white/60 small-regular truncate"></p>
                <ReplyPreviewContent message={message.replyTo} />
              </div>
            )}

            <div className="message-bubble message-sent w-full">
              <MessageContent message={message} />
            </div>

            <div className="flex items-center gap-1 mt-1">
              <span className="tiny-regular text-white/70">
                {getMessageTime(message.createdAt)}
              </span>
              <StatusIcon status={status} />
            </div>
            {Object.entries(groupMessageReactions).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(groupMessageReactions).map(([emoji, count]) => (
                  <button
                    key={emoji}
                    className="inline-flex items-center gap-0.5 bg-surface border border-default rounded-full px-2 py-0.5 tiny-regular hover:bg-surface-hover transition-colors duration-150"
                    onClick={() => handleReact(emoji)}
                  >
                    {emoji} {count > 1 && count}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // ── RECEIVED BUBBLE ──────────────────────────────────────
        <div
          className="flex items-center gap-2"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="avatar avatar-sm self-end shrink-0">
            {message.sender.fullName[0]}
          </div>

          {/* bubble content */}
          <div
            className="flex flex-col min-w-[150px] max-w-[70vw] sm:max-w-[55vw] md:max-w-[45vw]"
            onMouseEnter={() => {
              setShowReactionPicker(true);
            }}
            onMouseLeave={() => {
              setShowReactionPicker(false);
            }}
          >
            {showReactionPicker && (
              <div className="flex items-center justify-center gap-3 mb-2">
                {REACTIONS.map((r) => (
                  <div
                    key={r.key}
                    className="text-lg hover:scale-125 transition-transform duration-150 cursor-pointer"
                    onClick={() => handleReact(r.emoji)}
                  >
                    <p>{r.emoji}</p>
                  </div>
                ))}
              </div>
            )}
            {/* reply preview */}
            {message.replyTo && (
              <div className="w-full bg-surface border border-default border-l-2 border-l-primary-500 rounded-lg px-3 py-1.5 mb-1">
                <p className="text-brand-primary tiny-semibold truncate">
                  {message.replyTo.sender.username}
                </p>
                <ReplyPreviewContent message={message.replyTo} />
              </div>
            )}

            <div className="message-bubble message-received w-full">
              <MessageContent message={message} />
            </div>

            <span className="tiny-regular text-muted mt-1">
              {getMessageTime(message.createdAt)}
            </span>
            {Object.entries(groupMessageReactions).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(groupMessageReactions).map(([emoji, count]) => (
                  <button
                    key={emoji}
                    className="inline-flex items-center gap-0.5 bg-surface border border-default rounded-full px-2 py-0.5 tiny-regular hover:bg-surface-hover transition-colors duration-150"
                    onClick={() => handleReact(emoji)}
                  >
                    {emoji} {count > 1 && count}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* reply button — right of received bubble */}
          {isHovered && (
            <button
              className="btn-ghost p-1.5 rounded-lg text-muted hover:text-primary transition-colors duration-150 shrink-0"
              onClick={() => onReply(message)}
            >
              <BsReply size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
