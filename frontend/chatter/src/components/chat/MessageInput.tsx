import { useState, useRef } from 'react';
import { BsPaperclip, BsEmojiSmile } from 'react-icons/bs';
import { IoMdSend } from 'react-icons/io';
import { useChatStore } from '../../store/chatStore';
import { getSocket } from '../../socket/socketClient';
import { SOCKET_EVENTS } from '../../socket/events';

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [isSendDisabled, setIsSendDisabled] = useState(true);
  const { activeConversationId, sendMessage, isSendingMessage } =
    useChatStore();

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);

    setIsSendDisabled(value.trim() === '');

    if (!activeConversationId) return;

    const socket = getSocket();
    if (!socket) return;

    // emit typing start
    socket.emit(SOCKET_EVENTS.TYPING_START, activeConversationId);

    // clear existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // emit typing stop after 2 seconds of no typing
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit(SOCKET_EVENTS.TYPING_STOP, activeConversationId);
    }, 2000);
  };

  const handleSend = async () => {
    if (message.trim() === '' || !activeConversationId) return;

    const socket = getSocket();
    if (!socket) return;

    // emit stop typing
    socket.emit(SOCKET_EVENTS.TYPING_STOP, activeConversationId);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    // send message
    await sendMessage(activeConversationId, message.trim());
    setMessage('');
    setIsSendDisabled(true);
  };

  // enter button to send message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isSendDisabled) {
      handleSend();
    }
  };

  return (
    <div className="h-18 bg-light50_dark300 border-t border-default p-6 flex items-center justify-between gap-4">
      <button className="btn btn-ghost p-2">
        <BsPaperclip size={20} />
      </button>
      <input
        type="text"
        placeholder="Type a message..."
        className="input flex-1"
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
      />
      <button className="btn btn-ghost p-2">
        <BsEmojiSmile size={20} />
      </button>
      <button
        className="btn btn-primary p-2"
        onClick={handleSend}
        disabled={isSendDisabled || isSendingMessage}
      >
        <IoMdSend />
      </button>
    </div>
  );
};

export default MessageInput;
