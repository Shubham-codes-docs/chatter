import Chat from '../../components/chat/Chat';
import MainLayout from '../../components/dashboard/MainLayout';
// import EmptyState from '../../components/EmptyState';

const DashBoard = () => {
  return (
    <MainLayout>
      {/* <EmptyState /> */}
      <Chat />
    </MainLayout>
  );
};

export default DashBoard;
