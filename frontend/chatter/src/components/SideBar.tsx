import { ScrollArea } from './ui/scroll-area';

const chats = [
  {
    id: 1,
    name: 'John Doe',
    lastMessage: 'Hey! How are you?',
    time: '2:30 PM',
    unread: 2,
  },
  {
    id: 2,
    name: 'Sarah Smith',
    lastMessage: 'See you tomorrow!',
    time: '1:15 PM',
    unread: 0,
  },
  {
    id: 3,
    name: 'Mike Johnson',
    lastMessage: 'Thanks for the help',
    time: 'Yesterday',
    unread: 0,
  },
  {
    id: 4,
    name: 'Emily Davis',
    lastMessage: "Let's catch up soon",
    time: 'Monday',
    unread: 1,
  },
];

const SideBar = () => {
  return (
    <aside className="w-80 bg-light200_dark400 border-r border-default flex flex-col ">
      <div className="p-4 border-b border-default">
        <div className="flex-between mb-4">
          <h2 className="h3-bold">Messages</h2>
          <button className="btn btn-primary btn-sm">+ New</button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="p-4 border-b border-subtle hover:bg-white hover:dark:bg-dark-200 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="avatar avatar-md">{chat.name.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 justify-between mb-1">
                    <h3 className="body-medium text-primary font-semibold ">
                      {chat.name}
                    </h3>
                    <div className="flex items-center shrink-0 gap-2">
                      <div className="small-regular text-tertiary">
                        {chat.time}
                      </div>
                      {chat.unread > 0 && (
                        <span className="badge badge-primary">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="small-regular text-secondary truncate">
                    {chat.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-default">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="small-medium text-secondary">Online</span>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
