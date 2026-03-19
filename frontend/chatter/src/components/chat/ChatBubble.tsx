import type { Message, MessageStatus } from '../../types/api.types';
import {
  BsCheck,
  BsCheckAll,
  BsClock,
  BsExclamationCircle,
} from 'react-icons/bs';
import { getMessageTime } from '../../utils/messageUtils';

interface ChatBubbleProps {
  message: Message;
  isSent: boolean;
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

const ChatBubble = ({ message, isSent }: ChatBubbleProps) => {
  return isSent ? (
    <div className="flex items-end gap-3 mb-4 justify-end">
      <div>
        {message.replyTo && (
          <div className="bg-white/20 rounded p-2 mb-1 text-sm border-1-2 border-white/50">
            <p className="text-white/70 tiny-regular">
              {message.replyTo.sender.username}
            </p>
            <p className="text-white/80 truncate">{message.replyTo.content}</p>
          </div>
        )}
        <div className="message-bubble message-sent">{message.content}</div>

        <div className="flex items-center gap-1 justify-end mt-1">
          <span className="tiny-regular text-white/70">
            {getMessageTime(message.createdAt)}
          </span>
          <span className="text-white/70">
            {<StatusIcon status={message.status} />}
          </span>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-start gap-3 mb-4 ">
      <div className="avatar avatar-sm">{message.sender.fullName[0]}</div>
      <div>
        <div className="message-bubble message-received">{message.content}</div>
        <span className="tiny-regular text-muted mt-1">
          {getMessageTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default ChatBubble;
