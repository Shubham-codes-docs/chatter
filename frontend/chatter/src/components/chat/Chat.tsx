import { useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageArea from './MessageArea';
import MessageInput from './MessageInput';
import type { Message } from '../../types/api.types';

const Chat = () => {
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <MessageArea onReply={setReplyTo} />
      <MessageInput replyTo={replyTo} onReply={setReplyTo} />
    </div>
  );
};

export default Chat;
