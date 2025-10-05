import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listDrafts, deleteDraft } from '@/services/activityDraftService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Trash2, Edit3, RefreshCw } from 'lucide-react';

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
    navigate(`/dashboard/activities/create?draftId=${encodeURIComponent(draftId)}`);
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Rascunhos de Atividades</h1>
        <Button onClick={fetchDrafts} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus rascunhos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-10 text-center text-gray-500">Carregando...</div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-gray-500">Nenhum rascunho encontrado</div>
          ) : (
            <ul className="divide-y">
              {items.map((d) => (
                <li key={d.draftId} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-xs text-gray-500">Atualizado: {new Date(d.updated_at || d.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => handleOpen(d.draftId)} className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4" /> Continuar edição
                    </Button>
                    <Button variant="destructive" onClick={() => handleDelete(d.draftId)} className="flex items-center gap-2">
                      <Trash2 className="w-4 h-4" /> Excluir
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
