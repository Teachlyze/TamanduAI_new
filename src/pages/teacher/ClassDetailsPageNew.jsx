import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  MessageSquare,
  FileText,
  BarChart3,
  Bot,
  Settings,
  Copy,
  Link as LinkIcon,
  UserPlus,
  Calendar,
  Clock,
  BookOpen
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import toast from 'react-hot-toast';

// Componentes das tabs
import ClassFeedTab from '@/components/teacher/class-details/ClassFeedTab';
import ClassActivitiesTab from '@/components/teacher/class-details/ClassActivitiesTab';
import ClassMembersTab from '@/components/teacher/class-details/ClassMembersTab';
import ClassAnalyticsTab from '@/components/teacher/class-details/ClassAnalyticsTab';
import ClassChatbotTab from '@/components/teacher/class-details/ClassChatbotTab';

const ClassDetailsPageNew = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  useEffect(() => {
    if (classId && user) {
      loadClassData();
      generateInviteCodes();
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
      console.error('Error loading class:', error);
      toast.error('Erro ao carregar turma');
    } finally {
      setLoading(false);
    }
  };

  const generateInviteCodes = () => {
    // Gerar código de 6 dígitos
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setInviteCode(code);
    
    // Gerar link de convite
    const link = `${window.location.origin}/join-class/${classId}?code=${code}`;
    setInviteLink(link);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copiado!`);
  };

  if (loading) {
    return <LoadingScreen message="Carregando turma..." />;
  }

  if (!classData) {
    return null;
  }

  const tabs = [
    { id: 'feed', label: 'Feed', icon: MessageSquare, gradient: 'from-blue-500 to-cyan-500' },
    { id: 'activities', label: 'Atividades', icon: FileText, gradient: 'from-purple-500 to-pink-500' },
    { id: 'members', label: 'Alunos', icon: Users, gradient: 'from-emerald-500 to-teal-500' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, gradient: 'from-orange-500 to-red-500' },
    { id: 'chatbot', label: 'Assistente IA', icon: Bot, gradient: 'from-indigo-500 to-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/dashboard/classes')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar para Turmas</span>
            </button>

            <div className="flex items-center gap-3">
              <PremiumButton
                onClick={() => setShowInviteModal(true)}
                className="whitespace-nowrap inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:shadow-xl"
              >
                <UserPlus className="w-4 h-4" />
                <span>Convidar Alunos</span>
              </PremiumButton>

              <PremiumButton
                onClick={() => navigate(`/dashboard/classes/${classId}/settings`)}
                variant="outline"
                className="whitespace-nowrap inline-flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </PremiumButton>
            </div>
          </div>

          {/* Class Header Card */}
          <PremiumCard className="overflow-hidden">
            <div className={`bg-gradient-to-r ${classData.color || 'from-blue-600 to-cyan-600'} p-8 text-white`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-3">{classData.name}</h1>
                  <p className="text-lg opacity-90 mb-4">{classData.subject}</p>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{classData.students_count || 0} alunos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>{classData.activities_count || 0} atividades</span>
                    </div>
                    {classData.meeting_days && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{classData.meeting_days.join(', ')}</span>
                      </div>
                    )}
                    {classData.meeting_start_time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{classData.meeting_start_time} - {classData.meeting_end_time}</span>
                      </div>
                    )}
                  </div>
                </div>

                {classData.description && (
                  <div className="ml-8 max-w-md">
                    <p className="text-sm opacity-90">{classData.description}</p>
                  </div>
                )}
              </div>
            </div>
          </PremiumCard>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="inline-flex h-auto p-1 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-border">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="whitespace-nowrap inline-flex items-center gap-2 px-6 py-3 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:text-white transition-all"
                style={{
                  backgroundImage: activeTab === tab.id ? `linear-gradient(to right, var(--tw-gradient-stops))` : 'none'
                }}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="feed" className="mt-0">
                <ClassFeedTab classId={classId} classData={classData} />
              </TabsContent>

              <TabsContent value="activities" className="mt-0">
                <ClassActivitiesTab classId={classId} classData={classData} />
              </TabsContent>

              <TabsContent value="members" className="mt-0">
                <ClassMembersTab classId={classId} classData={classData} />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <ClassAnalyticsTab classId={classId} classData={classData} />
              </TabsContent>

              <TabsContent value="chatbot" className="mt-0">
                <ClassChatbotTab classId={classId} classData={classData} />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>

      {/* Modal de Convite */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-8"
            >
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Convidar Alunos
              </h2>

              <div className="space-y-6">
                {/* Código de Convite */}
                <div>
                  <label className="block text-sm font-medium mb-2">Código da Turma</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 p-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
                      <p className="text-3xl font-mono font-bold text-center tracking-wider text-emerald-700 dark:text-emerald-400">
                        {inviteCode}
                      </p>
                    </div>
                    <PremiumButton
                      onClick={() => copyToClipboard(inviteCode, 'Código')}
                      className="whitespace-nowrap inline-flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copiar</span>
                    </PremiumButton>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Os alunos podem entrar na turma usando este código
                  </p>
                </div>

                {/* Link de Convite */}
                <div>
                  <label className="block text-sm font-medium mb-2">Link de Convite</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-border overflow-hidden">
                      <p className="text-sm text-muted-foreground truncate">
                        {inviteLink}
                      </p>
                    </div>
                    <PremiumButton
                      onClick={() => copyToClipboard(inviteLink, 'Link')}
                      className="whitespace-nowrap inline-flex items-center gap-2"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>Copiar</span>
                    </PremiumButton>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Compartilhe este link direto com os alunos
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <PremiumButton
                  onClick={() => setShowInviteModal(false)}
                  className="whitespace-nowrap inline-flex items-center gap-2"
                >
                  <span>Fechar</span>
                </PremiumButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClassDetailsPageNew;
