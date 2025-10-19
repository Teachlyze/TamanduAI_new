import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Brain,
  Upload,
  FileText,
  Settings,
  TrendingUp,
  Save,
  RefreshCw,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  X,
  Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumInput } from '@/components/ui/PremiumInput';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import chatbotConfigService from '@/services/chatbotConfigService';
import toast from 'react-hot-toast';

const ChatbotConfigPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [training, setTraining] = useState(false);
  const [classData, setClassData] = useState(null);
  const [config, setConfig] = useState({
    enabled: true,
    keywords: [],
    themes: [],
    scopeRestrictions: []
  });
  const [materials, setMaterials] = useState([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [newTheme, setNewTheme] = useState('');
  const [stats, setStats] = useState(null);
  const [modelInfo, setModelInfo] = useState({
    name: 'GPT-4 Turbo',
    version: '2024-01',
    contextWindow: '128k tokens',
    lastTrained: null,
    totalTrainings: 0
  });

  useEffect(() => {
    if (classId && user) {
      loadData();
    }
  }, [classId, user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Buscar turma
      const { data: cls, error: classError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .single();

      if (classError) throw classError;
      setClassData(cls);

      // Buscar configuração do chatbot
      const { data: chatbotConfig, error: configError } = await supabase
        .from('chatbot_configurations')
        .select('*')
        .eq('class_id', classId)
        .maybeSingle();

      if (configError && configError.code !== 'PGRST116') throw configError;

      if (chatbotConfig) {
        setConfig({
          enabled: chatbotConfig.enabled,
          keywords: chatbotConfig.keywords || [],
          themes: chatbotConfig.themes || [],
          scopeRestrictions: chatbotConfig.scope_restrictions || []
        });
      }

      // Buscar materiais da turma
      const collectedMaterials = await chatbotConfigService.collectClassMaterials(classId);
      setMaterials(collectedMaterials);

      // Buscar estatísticas
      const report = await chatbotConfigService.generateUsageReport(
        classId,
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        new Date().toISOString()
      );
      setStats(report);

      // Buscar informações de treinamento
      const { data: trainingData } = await supabase
        .from('chatbot_training_data')
        .select('created_at')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (trainingData && trainingData.length > 0) {
        setModelInfo(prev => ({
          ...prev,
          lastTrained: trainingData[0].created_at,
          totalTrainings: trainingData.length
        }));
      }

    } catch (error) {
      console.error('Erro ao carregar:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      await chatbotConfigService.configureChatbot(classId, config);
      toast.success('Configurações salvas');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleTrainChatbot = async () => {
    if (materials.length === 0) {
      toast.error('Nenhum material disponível para treinamento');
      return;
    }

    try {
      setTraining(true);
      toast.loading('Treinando chatbot...', { id: 'training' });

      await chatbotConfigService.trainChatbot(classId, materials);

      toast.dismiss('training');
      toast.success('Chatbot treinado com sucesso!');
      loadData(); // Recarregar para atualizar status
    } catch (error) {
      toast.dismiss('training');
      console.error('Erro ao treinar:', error);
      toast.error('Erro ao treinar chatbot');
    } finally {
      setTraining(false);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !config.keywords.includes(newKeyword.trim())) {
      setConfig(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword) => {
    setConfig(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const addTheme = () => {
    if (newTheme.trim() && !config.themes.includes(newTheme.trim())) {
      setConfig(prev => ({
        ...prev,
        themes: [...prev.themes, newTheme.trim()]
      }));
      setNewTheme('');
    }
  };

  const removeTheme = (theme) => {
    setConfig(prev => ({
      ...prev,
      themes: prev.themes.filter(t => t !== theme)
    }));
  };

  if (loading) {
    return <LoadingScreen message="Carregando configurações..." />;
  }

  const breadcrumbItems = [
    { label: 'Turmas', path: '/dashboard/classes' },
    { label: classData?.name || 'Turma', path: `/dashboard/classes/${classId}` },
    { label: 'Chatbot IA', path: `/dashboard/classes/${classId}/chatbot` }
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header Premium */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-8 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Chatbot IA - {classData?.name}</h1>
                  <p className="text-white/90 text-sm mt-1">Assistente inteligente personalizado para sua turma</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                  🤖 Modelo: {modelInfo.name}
                </span>
                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                  📊 {modelInfo.contextWindow}
                </span>
                {modelInfo.lastTrained && (
                  <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                    ⚡ Último treino: {new Date(modelInfo.lastTrained).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <PremiumButton
                variant="outline"
                size="sm"
                leftIcon={RefreshCw}
                onClick={loadData}
                className="bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                Recarregar
              </PremiumButton>
              <PremiumButton
                variant="outline"
                size="sm"
                leftIcon={Save}
                onClick={handleSaveConfig}
                loading={saving}
                className="bg-white/10 hover:bg-white/20 text-white border-white/30"
              >
                Salvar
              </PremiumButton>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Premium */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <PremiumCard variant="elevated" className="relative overflow-hidden group hover:scale-105 transition-transform">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-5 group-hover:opacity-10 transition-opacity" />
            <div className="relative p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-white">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalInteractions}</p>
                  <p className="text-sm text-muted-foreground">Interações</p>
                </div>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard variant="elevated" className="relative overflow-hidden group hover:scale-105 transition-transform">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 opacity-5 group-hover:opacity-10 transition-opacity" />
            <div className="relative p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl text-white">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.uniqueStudents}</p>
                  <p className="text-sm text-muted-foreground">Alunos Ativos</p>
                </div>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard variant="elevated" className="relative overflow-hidden group hover:scale-105 transition-transform">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-5 group-hover:opacity-10 transition-opacity" />
            <div className="relative p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgInteractionsPerStudent.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Média/Aluno</p>
                </div>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard variant="elevated" className="relative overflow-hidden group hover:scale-105 transition-transform">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-5 group-hover:opacity-10 transition-opacity" />
            <div className="relative p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{modelInfo.totalTrainings}</p>
                  <p className="text-sm text-muted-foreground">Treinamentos</p>
                </div>
              </div>
            </div>
          </PremiumCard>
        </div>
      )}

      {/* Main Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Materials & Training */}
        <PremiumCard variant="elevated" className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Materiais & Treinamento</h3>
                <p className="text-sm text-muted-foreground">{materials.length} arquivos coletados da turma</p>
              </div>
            </div>
            <PremiumButton
              variant="gradient"
              size="lg"
              leftIcon={Brain}
              onClick={handleTrainChatbot}
              disabled={training || materials.length === 0}
              loading={training}
            >
              {training ? 'Treinando IA...' : 'Treinar Chatbot'}
            </PremiumButton>
          </div>

          {/* Info Box */}
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  💡 Como funciona o treinamento?
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  O chatbot analisa todos os materiais (PDFs, documentos, atividades) da turma e cria uma base de conhecimento. 
                  Quanto mais materiais, mais preciso será o assistente! Recomendamos retreinar após adicionar novos conteúdos.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {materials.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum material encontrado</p>
                <p className="text-sm">Poste arquivos PDF, DOCX ou TXT nas atividades</p>
              </div>
            ) : (
              materials.map((material, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {material.name || material.title || 'Conteúdo'}
                    </p>
                    <p className="text-xs text-muted-foreground">{material.type}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                </div>
              ))
            )}
          </div>
        </PremiumCard>

        {/* Keywords */}
        <PremiumCard variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-bold">Palavras-Chave</h3>
              <p className="text-sm text-muted-foreground">Termos importantes do conteúdo</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <PremiumInput
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                placeholder="Digite uma palavra-chave"
                className="flex-1"
              />
              <PremiumButton
                variant="outline"
                leftIcon={Plus}
                onClick={addKeyword}
              >
                Adicionar
              </PremiumButton>
            </div>

            <div className="flex flex-wrap gap-2">
              {config.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                >
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {config.keywords.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma palavra-chave adicionada</p>
              )}
            </div>
          </div>
        </PremiumCard>

        {/* Themes */}
        <PremiumCard variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-bold">Temas Principais</h3>
              <p className="text-sm text-muted-foreground">Assuntos abordados no curso</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <PremiumInput
                value={newTheme}
                onChange={(e) => setNewTheme(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTheme()}
                placeholder="Digite um tema"
                className="flex-1"
              />
              <PremiumButton
                variant="outline"
                leftIcon={Plus}
                onClick={addTheme}
              >
                Adicionar
              </PremiumButton>
            </div>

            <div className="flex flex-wrap gap-2">
              {config.themes.map((theme, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm flex items-center gap-2"
                >
                  {theme}
                  <button
                    onClick={() => removeTheme(theme)}
                    className="hover:text-destructive transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {config.themes.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum tema adicionado</p>
              )}
            </div>
          </div>
        </PremiumCard>

        {/* Model Info - NEW CARD */}
        <PremiumCard variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Modelo de IA</h3>
              <p className="text-sm text-muted-foreground">Informações técnicas</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Modelo</span>
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                  Avançado
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{modelInfo.name}</p>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-1">Versão</p>
              <p className="text-sm text-muted-foreground">{modelInfo.version}</p>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-1">Janela de Contexto</p>
              <p className="text-sm text-muted-foreground">{modelInfo.contextWindow}</p>
              <p className="text-xs text-muted-foreground mt-1">~384 páginas de texto</p>
            </div>

            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-1">Capacidades</p>
              <div className="space-y-1 mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span>Responde em português</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span>Explica conceitos complexos</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span>Tira dúvidas 24/7</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span>Busca nos materiais da turma</span>
                </div>
              </div>
            </div>
          </div>
        </PremiumCard>

        {/* Status */}
        <PremiumCard variant="elevated" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-xl font-bold">Status do Chatbot</h3>
              <p className="text-sm text-muted-foreground">Configuração atual</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="font-medium">Chatbot Ativo</span>
              <button
                onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`w-12 h-6 rounded-full transition-colors ${
                  config.enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  config.enabled ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Materiais coletados</span>
                <span className="font-medium">{materials.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Palavras-chave</span>
                <span className="font-medium">{config.keywords.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Temas</span>
                <span className="font-medium">{config.themes.length}</span>
              </div>
            </div>

            {config.enabled && materials.length > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      Chatbot Configurado
                    </p>
                    <p className="text-xs text-green-800 dark:text-green-200">
                      Os alunos já podem fazer perguntas
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(!config.enabled || materials.length === 0) && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      Configuração Pendente
                    </p>
                    <p className="text-xs text-orange-800 dark:text-orange-200">
                      {!config.enabled ? 'Ative o chatbot' : 'Adicione materiais para treinamento'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </PremiumCard>
      </div>
    </div>
  );
};

export default ChatbotConfigPage;
