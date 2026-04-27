import { useState } from 'react';
import ChatHeader from './ChatHeader';
import MessageArea from './MessageArea';
import MessageInput from './MessageInput';
import type { Message } from '../../types/api.types';
import { useSwipeToGoBack } from '../../hooks/useSwipeToGoBack';

const Chat = () => {
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const { onTouchStart, onTouchEnd } = useSwipeToGoBack();
  const [editingMessage, SetIsEditingMessage] = useState<Message | null>(null);

  return (
    <div
      className="flex flex-col h-full"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <ChatHeader />
      <MessageArea onReply={setReplyTo} onEdit={SetIsEditingMessage} />
      <MessageInput
        replyTo={replyTo}
        editingMessage={editingMessage}
        onReply={setReplyTo}
        onEdit={SetIsEditingMessage}
      />
    </div>
  );
};

export default Chat;
