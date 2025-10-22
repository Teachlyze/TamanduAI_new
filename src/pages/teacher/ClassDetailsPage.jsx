import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  BookOpen,
  BarChart3,
  MessageSquare,
  Settings,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';
import ClassGradingPage from '@/pages/teacher/ClassGradingPage';

const ClassDetailsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [activeTab, setActiveTab] = useState('grading'); // grading, members, activities, analytics

  useEffect(() => {
    if (classId && user) {
      loadClassData();
    }
  }, [classId, user]);

  const loadClassData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .eq('created_by', user.id)
        .single();

      if (error) throw error;
      if (!data) {
        toast.error('Turma não encontrada');
        navigate('/dashboard/classes');
        return;
      }

      setClassData(data);
    } catch (error) {
      console.error('Erro ao carregar turma:', error);
      toast.error('Erro ao carregar turma');
      navigate('/dashboard/classes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Carregando turma..." />;
  }

  if (!classData) {
    return <EmptyState icon={BookOpen} title="Turma não encontrada" />;
  }

  const tabs = [
    { id: 'grading', label: 'Correções', icon: CheckCircle },
    { id: 'members', label: 'Alunos', icon: Users },
    { id: 'activities', label: 'Atividades', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <PremiumButton
            variant="outline"
            size="sm"
            leftIcon={ArrowLeft}
            onClick={() => navigate('/dashboard/classes')}
            className="whitespace-nowrap inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 text-foreground border-border"
          >
            Voltar
          </PremiumButton>
          <div>
            <h1 className="text-3xl font-bold">{classData.name}</h1>
            <p className="text-muted-foreground">{classData.subject || 'Geral'}</p>
          </div>
        </div>
        <PremiumButton
          variant="outline"
          size="sm"
          leftIcon={Settings}
          onClick={() => navigate(`/dashboard/classes/${classId}/edit`)}
          className="whitespace-nowrap inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 text-foreground border-border"
        >
          Configurações
        </PremiumButton>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <PremiumCard variant="elevated" className="p-2">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </PremiumCard>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {activeTab === 'grading' && <ClassGradingPage classId={classId} />}
        {activeTab === 'members' && (
          <EmptyState icon={Users} title="Gerenciamento de alunos" description="Em desenvolvimento" />
        )}
        {activeTab === 'activities' && (
          <EmptyState icon={BookOpen} title="Atividades" description="Em desenvolvimento" />
        )}
        {activeTab === 'analytics' && (
          <EmptyState icon={BarChart3} title="Analytics" description="Em desenvolvimento" />
        )}
      </motion.div>
    </div>
  );
};

export default ClassDetailsPage;
