import { type ReactNode } from 'react';
import { useUIStore } from '../../store/uiStore';
import Header from '../Header';
import SideBar from '../SideBar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { mobileView } = useUIStore();

  return (
    <div className="flex flex-col h-screen bg-light100_dark500">
      {/* Header */}
      <div className={`${mobileView === 'chat' ? 'hidden md:block' : 'block'}`}>
        <Header />
      </div>

      {/* Content Area (Sidebar + Main) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <div
          className={`
          absolute inset-0 z-10 transition-transform duration-300 ease-in-out
          md:relative md:inset-auto md:h-full md:w-80 md:shrink-0 md:translate-x-0
          ${mobileView === 'chat' ? '-translate-x-full' : 'translate-x-0'}
        `}
        >
          <SideBar />
        </div>

        {/* Main Content */}
        <div
          className={`
          absolute inset-0 z-10 transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:flex-1
          ${mobileView === 'chat' ? 'translate-x-0' : 'translate-x-full'}
        `}
        >
          <main className="h-full overflow-hidden">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
