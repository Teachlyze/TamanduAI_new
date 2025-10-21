import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, Clock, AlertCircle, CheckCircle, Filter, Search, FileText, Calendar, Target, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

export default function StudentActivitiesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, completed
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    let mounted = true;
    
    (async () => {
      try {
        setLoading(true);
        
        // Buscar turmas do aluno
        const { data: classMemberships, error: classError } = await supabase
          .from('class_members')
          .select('class_id')
          .eq('user_id', user.id)
          .eq('role', 'student');

        if (classError) {
          console.error('❌ Erro ao buscar turmas do aluno:', classError);
          toast.error('Erro ao carregar suas turmas');
          if (mounted) setItems([]);
          return;
        }

        const classIds = classMemberships?.map(m => m.class_id) || [];
        
        if (classIds.length === 0) {
          console.log('ℹ️ Aluno não está em nenhuma turma');
          if (mounted) setItems([]);
          return;
        }

        // Buscar atividades das turmas do aluno
        const { data: activities, error: activitiesError } = await supabase
          .from('activities')
          .select(`
            id,
            title,
            description,
            due_date,
            max_score,
            activity_type,
            status,
            activity_class_assignments(
              class_id,
              classes(name, subject)
            ),
            classes (name, subject)
          `)
          .in('activity_class_assignments.class_id', classIds)
          .eq('status', 'published')
          .order('due_date', { ascending: true });

        if (activitiesError) {
          console.error('❌ Erro ao buscar atividades:', activitiesError);
          toast.error('Erro ao carregar atividades');
          if (mounted) setItems([]);
          return;
        }

        console.log(`✅ ${activities?.length || 0} atividades carregadas para o aluno`);
        if (mounted) {
          setItems(activities || []);
          setFilteredItems(activities || []);
        }
        
      } catch (error) {
        console.error('❌ Erro inesperado:', error);
        toast.error('Erro ao carregar atividades');
        if (mounted) {
          setItems([]);
          setFilteredItems([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    
    return () => { mounted = false; };
  }, [user]);

  // Filtrar atividades
  useEffect(() => {
    let filtered = items;

    // Filtrar por busca
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.classes?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por status (exemplo básico)
    if (filterStatus !== 'all') {
      const now = new Date();
      if (filterStatus === 'pending') {
        filtered = filtered.filter(item => new Date(item.due_date) >= now);
      } else if (filterStatus === 'completed') {
        filtered = filtered.filter(item => new Date(item.due_date) < now);
      }
    }

    setFilteredItems(filtered);
  }, [searchQuery, filterStatus, items]);

  if (loading) {
    return <LoadingScreen message="Carregando suas atividades..." />;
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Animado */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-8 text-white"
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
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Minhas Atividades</span>
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">Organize suas Tarefas 📚</h1>
          <p className="text-white/90 text-lg">Acompanhe seus prazos e mantenha tudo em dia</p>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-20 right-32 w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl"
        />
        <motion.div
          animate={{ 
            y: [0, 10, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          className="absolute bottom-10 right-20 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full"
        />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: "Total",
            value: items.length,
            icon: FileText,
            gradient: "from-blue-500 to-cyan-500"
          },
          {
            title: "Pendentes",
            value: items.filter(a => new Date(a.due_date) >= new Date()).length,
            icon: Clock,
            gradient: "from-yellow-500 to-orange-500"
          },
          {
            title: "Próximas 7 dias",
            value: items.filter(a => {
              const days = Math.ceil((new Date(a.due_date) - new Date()) / (1000 * 60 * 60 * 24));
              return days >= 0 && days <= 7;
            }).length,
            icon: AlertCircle,
            gradient: "from-red-500 to-pink-500"
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PremiumCard variant="elevated" className="relative overflow-hidden group hover:scale-105 transition-transform">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.title}</div>
              </div>
            </PremiumCard>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <PremiumCard variant="elevated" className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar atividades..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'pending', 'completed'].map((status) => (
                <PremiumButton
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  leftIcon={Filter}
                  className="whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border rounded-lg"
                >
                  {status === 'all' ? 'Todas' : status === 'pending' ? 'Pendentes' : 'Concluídas'}
                </PremiumButton>
              ))}
            </div>
          </div>
        </PremiumCard>
      </motion.div>

      {/* Activities List */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Nenhuma atividade encontrada"
          description={items.length === 0 ? "Quando seu professor publicar novas atividades, elas aparecerão aqui." : "Tente ajustar seus filtros de busca."}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredItems.map((activity, index) => {
              const daysUntil = Math.ceil((new Date(activity.due_date) - new Date()) / (1000 * 60 * 60 * 24));
              const isUrgent = daysUntil >= 0 && daysUntil <= 2;
              const isOverdue = daysUntil < 0;

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PremiumCard 
                    variant="elevated" 
                    className={`group relative overflow-hidden hover:scale-105 transition-all cursor-pointer ${
                      isUrgent ? 'border-2 border-orange-300 dark:border-orange-700' : 
                      isOverdue ? 'border-2 border-red-300 dark:border-red-700' : ''
                    }`}
                    onClick={() => navigate(`/dashboard/activities/${activity.id}`)}
                  >
                    {/* Glow Effect */}
                    {isUrgent && (
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl blur" />
                    )}
                    
                    <div className="relative p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                              <FileText className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                              {activity.title}
                            </h3>
                          </div>
                          {activity.classes && (
                            <span className="inline-flex items-center text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                              📚 {activity.classes.name}
                            </span>
                          )}
                        </div>
                        {isUrgent && (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <AlertCircle className="w-6 h-6 text-orange-600" />
                          </motion.div>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {activity.description || 'Sem descrição'}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(activity.due_date).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          {activity.max_score && (
                            <span className="text-xs font-bold text-primary">
                              <Target className="w-3 h-3 inline mr-1" />
                              {activity.max_score} pts
                            </span>
                          )}
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isOverdue ? 'bg-red-500 text-white' :
                            isUrgent ? 'bg-orange-500 text-white' : 
                            'bg-primary/10 text-primary'
                          }`}>
                            {isOverdue ? '⏰ Atrasada' : 
                             daysUntil === 0 ? '⚡ Hoje!' : 
                             daysUntil === 1 ? '⚡ Amanhã' : 
                             `🗓️ ${daysUntil} dias`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </PremiumCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
