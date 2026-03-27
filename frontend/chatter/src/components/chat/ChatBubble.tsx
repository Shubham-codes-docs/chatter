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

interface ChatBubbleProps {
  message: Message;
  isSent: boolean;
  onReply: (message: Message) => void;
}

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
          <div className="flex flex-col items-end min-w-[60px] max-w-[70vw] sm:max-w-[55vw] md:max-w-[45vw]">
            {/* reply preview */}
            {message.replyTo && (
              <div className="w-full bg-white/20 border-l-2 border-white/60 rounded-lg px-3 py-1.5 mb-1">
                <p className="text-white/80 tiny-semibold truncate">
                  {message.replyTo.sender.username}
                </p>
                <p className="text-white/60 small-regular truncate">
                  {message.replyTo.content}
                </p>
              </div>
            )}

            <div className="message-bubble message-sent w-full">
              {message.content}
            </div>

            <div className="flex items-center gap-1 mt-1">
              <span className="tiny-regular text-white/70">
                {getMessageTime(message.createdAt)}
              </span>
              <StatusIcon status={status} />
            </div>
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
          <div className="flex flex-col min-w-[100px] max-w-[70vw] sm:max-w-[55vw] md:max-w-[45vw]">
            {/* reply preview */}
            {message.replyTo && (
              <div className="w-full bg-surface border border-default border-l-2 border-l-primary-500 rounded-lg px-3 py-1.5 mb-1">
                <p className="text-brand-primary tiny-semibold truncate">
                  {message.replyTo.sender.username}
                </p>
                <p className="text-secondary small-regular truncate">
                  {message.replyTo.content}
                </p>
              </div>
            )}

            <div className="message-bubble message-received w-full">
              {message.content}
            </div>

            <span className="tiny-regular text-muted mt-1">
              {getMessageTime(message.createdAt)}
            </span>
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
