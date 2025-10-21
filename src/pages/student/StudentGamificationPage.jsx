import { motion } from 'framer-motion';
import { Trophy, Target, Clock, TrendingUp, Sparkles, Flame } from 'lucide-react';
import GamificationPanel from '@/components/gamification/GamificationPanel';
import MissionsPanel from '@/components/gamification/MissionsPanel';
import FocusMode from '@/components/gamification/FocusMode';
import ClassRanking from '@/components/gamification/ClassRanking';

const StudentGamificationPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: Trophy, gradient: 'from-yellow-500 to-orange-500' },
    { id: 'missions', name: 'Missões', icon: Target, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'focus', name: 'Modo Foco', icon: Clock, gradient: 'from-purple-500 to-pink-500' },
    { id: 'ranking', name: 'Rankings', icon: TrendingUp, gradient: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header Animado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 p-8 text-white"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4"
          >
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">Sistema de Gamificação</span>
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">Conquistas & Progresso 🏆</h1>
          <p className="text-white/90 text-lg">Complete missões, ganhe XP, suba de nível e conquiste badges!</p>
        </div>

        {/* Floating Trophy */}
        <motion.div
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-10 right-20 text-6xl opacity-20"
        >
          🏆
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 10, 0],
            rotate: [0, -10, 0]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          className="absolute bottom-10 right-32 text-5xl opacity-20"
        >
          ⭐
        </motion.div>
      </motion.div>

      {/* Tabs Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto p-1"
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`relative inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-6 py-3 font-medium transition-all border ${
                isActive
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg border-transparent`
                  : 'bg-white dark:bg-slate-900 text-foreground hover:bg-slate-50 dark:hover:bg-slate-800 border-border'
              } w-full sm:w-auto`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-xl`}
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-2 w-full">
                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${
                  isActive ? 'bg-white/20 text-white' : `bg-gradient-to-r ${tab.gradient} text-white/90`
                }`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="whitespace-nowrap">{tab.name}</span>
              </div>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="pb-8"
      >
        {activeTab === 'overview' && <GamificationPanel />}
        {activeTab === 'missions' && <MissionsPanel />}
        {activeTab === 'focus' && <FocusMode />}
        {activeTab === 'ranking' && (
          <div className="space-y-6">
            <div className="rounded-2xl border-2 border-dashed border-border/50 bg-card p-8 text-center">
              <div className="text-6xl mb-4">🏅</div>
              <h3 className="text-xl font-bold mb-2">Rankings em Desenvolvimento</h3>
              <p className="text-muted-foreground mb-4">
                Em breve você poderá ver seu ranking nas turmas!
              </p>
              <p className="text-sm text-muted-foreground">
                (Funcionalidade: lista de turmas do aluno e rankings)
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default StudentGamificationPage;
