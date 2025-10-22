import React, { LoadingScreen, useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { SidebarPremium, HeaderPremium } from '@/components/ui';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';

  const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Close sidebar when route changes on mobile
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (!user) {
    return null;
  }
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar Premium - Fixed width 280px */}
      <SidebarPremium isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content - Pushes to the right on desktop */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header Premium */}
        <HeaderPremium onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main scrollable content area */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
};

export default Dashboard;
