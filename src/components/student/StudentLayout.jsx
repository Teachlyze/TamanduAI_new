import { motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import StudentSidebar from '@/components/student/StudentSidebar';
import StudentChatSidebar from './StudentChatSidebar';

const StudentLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(true);
  const location = useLocation();

  // Detectar se está em uma turma ou atividade para mostrar chatbot contextual
  const isInClass = location.pathname.includes('/classes/');
  const isInActivity = location.pathname.includes('/activities/');
  const showChatbot = isInClass || isInActivity;

  // Extrair IDs da URL
  const classId = location.pathname.match(/\/classes\/([^\/]+)/)?.[1];
  const activityId = location.pathname.match(/\/activities\/([^\/]+)/)?.[1];

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
      <StudentSidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <motion.main
        animate={{ 
          marginLeft: sidebarCollapsed ? 0 : 280,
          marginRight: showChatbot ? (chatCollapsed ? 60 : 380) : 0
        }}
        transition={{ type: 'spring', damping: 20 }}
        className="flex-1 overflow-y-auto"
      >
        <div className="min-h-full p-6">
          <Outlet />
        </div>
      </motion.main>

      {/* Chatbot Sidebar - só aparece em turmas e atividades */}
      {showChatbot && (
        <StudentChatSidebar 
          collapsed={chatCollapsed} 
          setCollapsed={setChatCollapsed}
          classId={classId}
          activityId={activityId}
        />
      )}
    </div>
  );
};

export default StudentLayout;
