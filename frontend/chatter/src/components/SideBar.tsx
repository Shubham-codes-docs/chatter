import { ScrollArea } from './ui/scroll-area';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useEffect } from 'react';
import {
  formatConversationTime,
  getConversationAvatar,
  getConversationName,
  getLastMessage,
  getOnlineStatus,
} from '../utils/conversationUtils';

const SideBar = () => {
  const {
    conversations,
    fetchConversations,
    setActiveConversationId,
    activeConversationId,
    onlineUsers,
    unreadCounts,
    typingUsers,
  } = useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  if (!user) return;

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
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setActiveConversationId(conversation.id)}
              className={`p-4 border-b border-subtle hover:bg-white hover:dark:bg-dark-200 cursor-pointer transition-colors ${activeConversationId === conversation.id ? 'bg-white dark:bg-dark-200' : ''} `}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <div className="avatar avatar-md">
                    {getConversationAvatar(conversation, user.id)}
                  </div>
                  {getOnlineStatus(conversation, user.id, onlineUsers) && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 justify-between mb-1">
                    <h3 className="body-medium text-primary font-semibold ">
                      {getConversationName(conversation, user.id)}
                    </h3>
                    <div className="flex items-center shrink-0 gap-2">
                      <div className="small-regular text-tertiary">
                        {formatConversationTime(conversation.updatedAt)}
                      </div>
                      {unreadCounts[conversation.id] > 0 && (
                        <span className="badge badge-primary">
                          {unreadCounts[conversation.id]}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="small-regular text-secondary truncate">
                    {getLastMessage(conversation, typingUsers, user.id)}
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
