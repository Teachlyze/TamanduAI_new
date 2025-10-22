import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import SchoolSidebar from '@/components/school/SchoolSidebar';

const SchoolLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <SchoolSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <motion.main
        animate={{ marginLeft: sidebarCollapsed ? 80 : 280 }}
        transition={{ type: 'spring', damping: 20 }}
        className="flex-1 overflow-y-auto overflow-x-hidden"
      >
        <div className="min-h-full p-6 max-w-full">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
};

export default SchoolLayout;
