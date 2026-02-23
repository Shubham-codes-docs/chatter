import { ScrollArea } from '../ui/scroll-area';
import ChatBubble from './ChatBubble';

const MessageArea = () => {
  const fakeMessages = [
    {
      id: 1,
      content: 'Hey! How are you?',
      senderId: '2',
      timestamp: new Date('2024-01-10T10:30:00'),
    },
    {
      id: 2,
      content: "I'm great! Thanks for asking 😊",
      senderId: '1', // Current user
      timestamp: new Date('2024-01-10T10:32:00'),
    },
    {
      id: 3,
      content: 'Want to grab lunch today?',
      senderId: '2',
      timestamp: new Date('2024-01-10T12:45:00'),
    },
  ];

  return (
    <ScrollArea className="p-6 flex-1 overflow-y-auto">
      <div className="divider-text my-6">Today</div>
      {fakeMessages.map((message) => (
        <ChatBubble
          key={message.id}
          message={message}
          isSent={message.senderId === '1'}
        />
      ))}
    </ScrollArea>
  );
};

export default MessageArea;
