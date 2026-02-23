import ChatHeader from './ChatHeader';
import MessageArea from './MessageArea';
import MessageInput from './MessageInput';

const Chat = () => {
  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <MessageArea />
      <MessageInput />
    </div>
  );
};

export default Chat;
