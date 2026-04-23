import Chat from '../../components/chat/Chat';
import MainLayout from '../../components/dashboard/MainLayout';
import EmptyState from '../../components/EmptyState';
import { useChatStore } from '../../store/chatStore';

const DashBoard = () => {
  const { activeConversationId } = useChatStore();

  return (
    <MainLayout>
      <div className="h-full overflow-hidden">
        {activeConversationId ? (
          <Chat />
        ) : (
          <div className="hidden md:flex h-full">
            <EmptyState
              icon="💬"
              title="No chat selected"
              description="Select a conversation or start a new chat"
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default DashBoard;
