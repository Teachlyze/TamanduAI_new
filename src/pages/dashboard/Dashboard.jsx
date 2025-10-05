import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Close sidebar when route changes
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Toast notifications */}
        <Toaster />
      </div>
    </div>
  );
};

export default Dashboard;
