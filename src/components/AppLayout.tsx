
import React from 'react';
import { Outlet } from 'react-router-dom';
import MobileNavbar from './MobileNavbar';
import Sidebar from './Sidebar';

const AppLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar for desktop screens */}
      <Sidebar className="hidden md:flex" />
      
      {/* Main content area */}
      <main className="flex-1 pb-16 md:pb-0 md:pl-64">
        <div className="container mx-auto px-4 py-4">
          <Outlet />
        </div>
      </main>
      
      {/* Mobile navigation */}
      <MobileNavbar />
    </div>
  );
};

export default AppLayout;
