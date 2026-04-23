import { useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageArea from './MessageArea';
import MessageInput from './MessageInput';
import type { Message } from '../../types/api.types';
import { useSwipeToGoBack } from '../../hooks/useSwipeToGoBack';

const Chat = () => {
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const { onTouchStart, onTouchEnd } = useSwipeToGoBack();

  return (
    <div
      className="flex flex-col h-full"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <ChatHeader />
      <MessageArea onReply={setReplyTo} />
      <MessageInput replyTo={replyTo} onReply={setReplyTo} />
    </div>
  );
};

export default Chat;
