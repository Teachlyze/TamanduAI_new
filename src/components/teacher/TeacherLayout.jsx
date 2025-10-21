import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import TeacherSidebar from '@/components/teacher/TeacherSidebar';
import { useAuth } from '@/hooks/useAuth';

const TeacherLayout = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!user?.id) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20">
      <TeacherSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <motion.main
        animate={{ marginLeft: sidebarCollapsed ? 0 : 280 }}
        transition={{ type: 'spring', damping: 20 }}
        className="flex-1 overflow-y-auto"
      >
        <div className="min-h-full p-6">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
};

export default TeacherLayout;
