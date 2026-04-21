import Chat from '../../components/chat/Chat';
import MainLayout from '../../components/dashboard/MainLayout';
import EmptyState from '../../components/EmptyState';
import { useChatStore } from '../../store/chatStore';

const DashBoard = () => {
  const { activeConversationId } = useChatStore.getState();

  return (
    <MainLayout>
      {!activeConversationId && (
        <EmptyState
          icon="💬"
          title="No chat selected"
          description="Select a conversation or start a new chat"
        />
      )}
      <Chat />
    </MainLayout>
  );
};

export default DashBoard;
