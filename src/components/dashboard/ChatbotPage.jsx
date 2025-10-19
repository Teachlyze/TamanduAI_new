import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useClass } from '@/contexts/ClassContext';
import { useAuth } from "@/hooks/useAuth";
import { Logger } from '@/services/logger';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageSquare,
  Send,
  Upload,
  FileText,
  Settings,
  Bot,
  User,
  Brain,
  Zap,
  BookOpen,
  TrendingUp,
  Lightbulb,
  GraduationCap,
  Sparkles,
  Clock,
  CheckCircle,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const ChatbotPage = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', content: 'Olá! Sou o assistente da TamanduAI. Selecione uma turma para começar.', timestamp: new Date() }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [trainingMaterials, setTrainingMaterials] = useState([]);

  const { selectedClass, selectClass, materials, addMaterial, setTrainingMaterials: setGlobalTrainingMaterials } = useClass();
  const { user } = useAuth();
  // Estados para carregamento não-bloqueante
  const [isPageLoading, setIsPageLoading] = useState(true);
  // Estados locais faltantes
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Prefetch classes for fast dropdown
  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        setLoadingClasses(true);
        const { data, error } = await supabase
          .from('classes')
          .select('id, name')
          .eq('created_by', user.id)
          .order('name', { ascending: true })
          .limit(200);
        if (error) throw error;
        setTeacherClasses(data || []);
      } catch (e) {
        Logger.error('Falha ao carregar turmas para ChatbotPage', e);
      } finally {
        setLoadingClasses(false);
      }
    };
    load();
  }, [user]);

  // Get current class materials
  const currentClassMaterials = selectedClass ? materials[selectedClass.id] || [] : [];

  const handleSendMessage = () => {
    if (!message.trim()) return;

    if (!selectedClass) {
      toast({
        title: "Selecione uma turma primeiro",
        description: "Você precisa selecionar uma turma para interagir com o chatbot.",
        variant: "destructive",
      });
      return;
    }

    const newMessage = { id: messages.length + 1, type: 'user', content: message, timestamp: new Date() };
    setMessages([...messages, newMessage]);
    setMessage('');

    Logger.info('Mensagem enviada para chatbot', {
      classId: selectedClass.id,
      className: selectedClass.name,
      messageLength: message.length
    });

    // Simulate chatbot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: `Esta é uma resposta simulada do chatbot para a turma ${selectedClass.name}. A funcionalidade completa será implementada com a integração da OpenAI API.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleAction = (action) => {
    if (!selectedClass) {
      toast({
        title: "Selecione uma turma primeiro",
        description: "Você precisa selecionar uma turma para usar essa funcionalidade.",
        variant: "destructive",
      });
      return;
    }

    switch (action) {
      case 'upload':
        setShowUploadDialog(true);
        break;
      case 'manage_materials':
        setShowMaterialDialog(true);
        break;
      case 'retrain':
        toast({
          title: "Retreinar Modelo",
          description: `Iniciando retreinamento do modelo para ${selectedClass.name}...`,
        });
        break;
      default:
        toast({
          title: "🚧 Funcionalidade em desenvolvimento",
          description: "Esta funcionalidade ainda não foi implementada—mas você pode solicitá-la no seu próximo prompt! 🚀",
        });
    }
  };

  const handleFileUpload = async (event) => {
    if (!selectedClass) {
      toast({
        title: "Selecione uma turma primeiro",
        description: "Você precisa selecionar uma turma para carregar materiais.",
        variant: "destructive",
      });
      return;
    }

    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const newFiles = files.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        date: new Date().toLocaleDateString('pt-BR'),
        status: 'processing',
        classId: selectedClass.id,
        file: file,
        type: file.type
      }));

      // Add files to the specific class
      newFiles.forEach(file => addMaterial(selectedClass.id, file));

      // Simulate file processing
      setTimeout(() => {
        const updatedFiles = newFiles.map(f => ({ ...f, status: 'processed' }));
        // Update the materials state
        updatedFiles.forEach(file => addMaterial(selectedClass.id, file));

        toast({
          title: "Arquivos processados",
          description: `${newFiles.length} arquivo(s) foram adicionados à turma ${selectedClass.name}.`,
        });

        // Add bot message about the upload
        const botMessage = {
          id: messages.length + 1,
          type: 'bot',
          content: `✅ Processamento concluído! ${newFiles.length} arquivo(s) foram adicionados ao contexto da turma ${selectedClass.name} e estão prontos para uso pelos alunos.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);

        Logger.info('Arquivos carregados com sucesso', {
          classId: selectedClass.id,
          className: selectedClass.name,
          fileCount: newFiles.length
        });

      }, 2000);

    } catch (error) {
      Logger.error('Erro no upload de arquivos', error);
      toast({
        title: "Erro no upload",
        description: "Ocorreu um erro ao processar os arquivos.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMaterialToggle = (materialId, isChecked) => {
    setTrainingMaterials(prev => {
      if (isChecked) {
        return [...prev, materialId];
      } else {
        return prev.filter(id => id !== materialId);
      }
    });
  };

  const handleSaveTrainingMaterials = () => {
    setGlobalTrainingMaterials(selectedClass.id, trainingMaterials);
    toast({
      title: "Materiais de treinamento salvos",
      description: `${trainingMaterials.length} material(is) selecionado(s) para treinamento da IA.`,
    });
    setShowMaterialDialog(false);
    Logger.info('Materiais de treinamento atualizados', {
      classId: selectedClass.id,
      materialCount: trainingMaterials.length
    });
  };

  const getClassName = (classId) => {
    return selectedClass?.name || 'Turma não encontrada';
  };

  const howToSteps = [
    { icon: GraduationCap, text: "Selecione uma turma para definir o contexto da IA.", color: "from-blue-500 to-blue-600" },
    { icon: Upload, text: "Carregue seus materiais de aula (PDFs, Docs, etc).", color: "from-green-500 to-green-600" },
    { icon: Brain, text: "A IA será treinada automaticamente com seu conteúdo.", color: "from-purple-500 to-purple-600" },
    { icon: MessageSquare, text: "Pronto! Seus alunos já podem conversar com o chatbot.", color: "from-orange-500 to-orange-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950 dark:via-purple-950 dark:to-fuchsia-950">
      <div className="space-y-8 p-6">
        {/* Header com gradiente */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-12 rounded-3xl shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-slate-200/50 dark:border-slate-700/50"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">Chatbot IA</h1>
                    <p className="text-blue-100 text-lg">Gerencie o assistente inteligente das suas turmas</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="min-w-[240px]">
                  <Select
                    value={selectedClass?.id ? String(selectedClass.id) : ''}
                    onValueChange={(classId) => {
                      const cls = teacherClasses.find(c => String(c.id) === classId);
                      if (cls) selectClass(cls);
                    }}
                  >
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue placeholder={loadingClasses ? 'Carregando turmas...' : (selectedClass ? selectedClass.name : 'Selecionar Turma')} />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherClasses.map((cls) => (
                        <SelectItem key={cls.id} value={String(cls.id)}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
                  onClick={() => handleAction('upload')}
                  disabled={!selectedClass}
                >
                  <Upload className="mr-2 w-5 h-5" />
                  {isUploading ? 'Carregando...' : 'Carregar Material'}
                </Button>
              </div>
            </div>
          </div>

          {/* Elementos decorativos */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </motion.div>

        {/* Como usar a IA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-12 rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-800/90 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-3xl transition-all duration-500"
        >
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mr-4">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Como usar a IA do TamanduAI</h2>
              <p className="text-gray-600">Siga estes passos para configurar seu assistente inteligente</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howToSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="relative group"
              >
                <div className={`p-8 rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-800/90 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-3xl transition-all duration-500 hover:shadow-xl transition-all duration-300 group-hover:scale-105 ${!selectedClass ? 'opacity-50' : ''}`}>
                  <div className={`w-14 h-14 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 font-medium leading-relaxed">{step.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="p-8 rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-800/90 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-3xl transition-all duration-500">
              {/* Chat Header */}
              <div className="p-8 rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-800/90 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-3xl transition-all duration-500">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <Bot className="w-7 h-7 text-white" />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      selectedClass ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">TamanduAI Assistant</h3>
                    <p className="text-gray-600">
                      {selectedClass ? `Contexto: ${selectedClass.name}` : 'Aguardando seleção de turma'}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="p-8 rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-800/90 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-3xl transition-all duration-500">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : 'bg-gradient-to-r from-blue-500 to-purple-600'
                      }`}>
                        {msg.type === 'user' ?
                          <User className="w-5 h-5 text-white" /> :
                          <Bot className="w-5 h-5 text-white" />
                        }
                      </div>
                      <div className={`px-4 py-3 rounded-2xl ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                          : 'bg-white/80 backdrop-blur-sm text-gray-900 border border-white/50'
                      }`}>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p className={`text-xs mt-2 ${
                          msg.type === 'user' ? 'text-green-200' : 'text-gray-500'
                        }`}>
                          {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              <div className="p-8 rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-800/90 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-3xl transition-all duration-500">
                <div className="flex space-x-3">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={selectedClass ? "Digite sua pergunta..." : "Selecione uma turma primeiro para conversar..."}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 h-12 bg-white/70 backdrop-blur-sm border-white/50 rounded-xl"
                    disabled={!selectedClass}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!selectedClass}
                    className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Materiais da Turma */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Materiais da Turma</h3>
                    <p className="text-sm text-gray-600">
                      {selectedClass ? `Turma: ${selectedClass.name}` : 'Selecione uma turma para ver os materiais'}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="space-y-3">
                  {currentClassMaterials.length > 0 ? (
                    currentClassMaterials.map((file, index) => (
                      <motion.div
                        key={file.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center space-x-3 p-8 rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-800/90 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-3xl transition-all duration-500"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.size} • {file.date}</p>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          file.status === 'processed' ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          {file.status === 'processed' ?
                            <CheckCircle className="w-4 h-4 text-green-600" /> :
                            <Clock className="w-4 h-4 text-yellow-600" />
                          }
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="p-12 rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-800/90 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-3xl transition-all duration-500">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-gray-500">
                        {selectedClass
                          ? `Nenhum material carregado para ${selectedClass.name}`
                          : 'Nenhum material carregado ainda'
                        }
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {selectedClass
                          ? 'Clique em "Carregar Material" para adicionar conteúdo'
                          : 'Selecione uma turma primeiro'
                        }
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-white/50 hover:bg-white/80 border-white/50"
                      onClick={() => handleAction('manage_materials')}
                      disabled={!selectedClass}
                    >
                      <FolderOpen className="mr-2 w-4 h-4" />
                      Gerenciar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Status do Treinamento */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Status do Treinamento</h3>
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-8 rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-800/90 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-3xl transition-all duration-500">
                    <span className="text-sm text-gray-600">Modelo atual</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">Ativo</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-8 rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-800/90 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-3xl transition-all duration-500">
                    <span className="text-sm text-gray-600">Última atualização</span>
                    <span className="text-sm text-gray-900 font-medium">Hoje, {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center justify-between p-8 rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-800/90 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-3xl transition-all duration-500">
                    <span className="text-sm text-gray-600">Materiais ativos</span>
                    <span className="text-sm text-purple-600 font-bold">{trainingMaterials.length}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-white/50 hover:bg-white/80 border-white/50"
                    onClick={() => handleAction('retrain')}
                    disabled={!selectedClass}
                  >
                    <Zap className="mr-2 w-4 h-4" />
                    Retreinar Modelo
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogContent className="bg-white/90 backdrop-blur-sm border-white/50">
            <DialogHeader>
              <DialogTitle>Carregar Material - {selectedClass?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Selecione os arquivos que deseja adicionar ao contexto da turma {selectedClass?.name}.
              </p>
              <Input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Clock className="w-4 h-4 animate-spin" />
                  Processando arquivos...
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Material Management Dialog */}
        <Dialog open={showMaterialDialog} onOpenChange={setShowMaterialDialog}>
          <DialogContent className="p-12 rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-800/90 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-3xl transition-all duration-500">
            <DialogHeader>
              <DialogTitle>Gerenciar Materiais - {selectedClass?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Selecione quais materiais serão usados como base de dados para treinamento da IA.
              </p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {currentClassMaterials.map((material) => (
                  <div key={material.id} className="flex items-center space-x-3 p-6 rounded-3xl shadow-2xl bg-white/90 dark:bg-gray-800/90 border border-slate-200/50 dark:border-slate-600/50 hover:shadow-3xl transition-all duration-500">
                    <Checkbox
                      id={material.id}
                      checked={trainingMaterials.includes(material.id)}
                      onCheckedChange={(checked) => handleMaterialToggle(material.id, checked)}
                    />
                    <div className="flex-1">
                      <label htmlFor={material.id} className="text-sm font-medium cursor-pointer">
                        {material.name}
                      </label>
                      <p className="text-xs text-gray-500">
                        {material.size} • {material.date}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      material.status === 'processed' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {material.status === 'processed' ?
                        <CheckCircle className="w-4 h-4 text-green-600" /> :
                        <Clock className="w-4 h-4 text-yellow-600" />
                      }
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowMaterialDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveTrainingMaterials}>
                  Salvar Seleção
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ChatbotPage;
