import { useState } from 'react';
import { BsPaperclip, BsEmojiSmile } from 'react-icons/bs';
import { IoMdSend } from 'react-icons/io';

const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [isSendDisabled, setIsSendDisabled] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    setIsSendDisabled(value.trim() === '');
  };

  const handleSend = () => {
    if (message.trim() === '') return;
    // Logic to send the message goes here
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
        disabled={isSendDisabled}
      >
        <IoMdSend />
      </button>
    </div>
  );
};

export default MessageInput;
