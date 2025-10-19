import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { listDrafts, deleteDraft } from '@/services/activityDraftService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Trash2, Edit3, RefreshCw, Clock, Save } from 'lucide-react';

export default function DraftsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDrafts = useCallback(async () => {
    try {
      setLoading(true);
      const drafts = await listDrafts();
      setItems(drafts);
    } catch (e) {
      console.warn('Erro ao listar rascunhos:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const handleOpen = async (draftId) => {
    navigate(`/dashboard/activities/new?draftId=${encodeURIComponent(draftId)}`);
  };

  const handleDelete = async (draftId) => {
    if (!confirm('Remover este rascunho?')) return;
    try {
      await deleteDraft(draftId);
      await fetchDrafts();
    } catch (e) {
      console.warn('Erro ao remover rascunho:', e);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white"
      >
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                📝 Rascunhos de Atividades
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                Continue editando suas atividades salvas como rascunho
              </p>
            </div>
            <Button 
              onClick={fetchDrafts}
              className="bg-white text-blue-600 hover:bg-blue-50"
              size="lg"
              disabled={loading}
            >
              <RefreshCw className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-2xl"></div>
        <div className="hidden lg:block absolute top-8 right-8">
          <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Save className="w-12 h-12 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <CardContent className="p-6">
            {loading ? (
              <div className="py-16 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Carregando rascunhos...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 text-center">
                <FileText className="w-24 h-24 mx-auto mb-6 text-gray-300 dark:text-gray-600" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Nenhum rascunho encontrado
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Seus rascunhos salvos aparecerão aqui
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((d, index) => (
                  <motion.div
                    key={d.draftId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {d.name || 'Sem título'}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>Atualizado: {formatDate(d.updated_at || d.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => handleOpen(d.draftId)} 
                          className="flex items-center gap-2 rounded-xl"
                        >
                          <Edit3 className="w-4 h-4" /> 
                          Continuar edição
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={() => handleDelete(d.draftId)} 
                          className="flex items-center gap-2 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" /> 
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
