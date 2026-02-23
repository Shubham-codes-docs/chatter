interface ChatBubbleProps {
  message: {
    content: string;
    senderId: string;
    timestamp: Date;
  };
  isSent: boolean;
}

const ChatBubble = ({ message, isSent }: ChatBubbleProps) => {
  const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const sender = { name: 'John Doe' };

  return isSent ? (
    <div className="flex items-end gap-3 mb-4 justify-end">
      <div>
        <div className="message-bubble message-sent">{message.content}</div>

        <div className="flex items-center gap-1 justify-end mt-1">
          <span className="tiny-regular text-white/70">{time}</span>
          <span className="text-white/70">✓✓</span>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-start gap-3 mb-4 ">
      <div className="avatar avatar-sm">{sender.name[0]}</div>
      <div>
        <div className="message-bubble message-received">{message.content}</div>
        <span className="tiny-regular text-muted mt-1">{time}</span>
      </div>
    </div>
  );
};

export default ChatBubble;
