import React from 'react';
import { Outlet } from 'react-router-dom';
import MobileNavbar from './MobileNavbar';
import Sidebar from './Sidebar';

const AppLayout = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      {/* Sidebar for desktop screens */}
      <Sidebar className="hidden md:flex md:w-64 md:flex-shrink-0" />

      {/* Main content area */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto pb-16 md:pb-0 md:pl-64">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile navigation */}
      <MobileNavbar className="md:hidden fixed bottom-0 left-0 right-0 z-50" />
    </div>
  );
};

export default AppLayout;