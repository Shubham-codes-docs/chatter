import Header from '../Header';
import SideBar from '../SideBar';

import type { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex flex-col h-screen bg-light100_dark500">
      {/* Header */}
      <Header />

      {/* Content Area (Sidebar + Main) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <SideBar />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
