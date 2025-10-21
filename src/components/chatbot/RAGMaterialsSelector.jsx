import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Image,
  Film,
  Link as LinkIcon,
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  RefreshCw,
  Download
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';

const RAGMaterialsSelector = ({ classId }) => {
  const [materials, setMaterials] = useState([]);
  const [activities, setActivities] = useState([]);
  const [trainingSources, setTrainingSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [externalUrl, setExternalUrl] = useState('');

  useEffect(() => {
    loadData();
  }, [classId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar materiais da turma
      const { data: materialsData } = await supabase
        .from('class_materials')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      // Carregar atividades da turma
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      // Carregar fontes de treinamento RAG
      const { data: sourcesData } = await supabase
        .from('rag_training_sources')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      setMaterials(materialsData || []);
      setActivities(activitiesData || []);
      setTrainingSources(sourcesData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tamanho (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 50MB.',
      });
      return;
    }

    // Validar tipo
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Tipo de arquivo não suportado',
        description: 'Apenas PDF, Word, PowerPoint e TXT são aceitos.',
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Upload do arquivo para Storage
      const fileName = `${classId}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('rag-materials')
        .upload(fileName, file, {
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(Math.round(percent));
          },
        });

      if (uploadError) throw uploadError;

      // 2. Obter URL pública
      const { data: urlData } = supabase.storage
        .from('rag-materials')
        .getPublicUrl(fileName);

      // 3. Criar registro em rag_training_sources
      const { data: sourceData, error: sourceError } = await supabase
        .from('rag_training_sources')
        .insert({
          class_id: classId,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          is_active: false, // Desabilitado por padrão até processar
          embedding_status: 'pending',
        })
        .select()
        .single();

      if (sourceError) throw sourceError;

      toast({
        title: '✅ Upload concluído!',
        description: 'O arquivo será processado em breve.',
      });

      // 4. Processar embeddings (chamar edge function)
      await processEmbeddings(sourceData.id);

      loadData();
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        variant: 'destructive',
        title: 'Erro no upload',
        description: error.message,
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAddExternalUrl = async () => {
    if (!externalUrl.trim()) return;

    try {
      const { data, error } = await supabase
        .from('rag_training_sources')
        .insert({
          class_id: classId,
          file_name: externalUrl,
          file_url: externalUrl,
          file_type: 'url',
          is_active: false,
          embedding_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '✅ URL adicionada!',
        description: 'O conteúdo será processado em breve.',
      });

      await processEmbeddings(data.id);
      setExternalUrl('');
      loadData();
    } catch (error) {
      console.error('Erro ao adicionar URL:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar URL',
        description: error.message,
      });
    }
  };

  const toggleSource = async (sourceId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('rag_training_sources')
        .update({ is_active: !currentStatus })
        .eq('id', sourceId);

      if (error) throw error;

      toast({
        title: !currentStatus ? '✅ Fonte ativada' : '⏸️ Fonte desativada',
        description: !currentStatus
          ? 'Esta fonte agora será usada pelo chatbot.'
          : 'Esta fonte não será mais usada pelo chatbot.',
      });

      loadData();
    } catch (error) {
      console.error('Erro ao alternar fonte:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    }
  };

  const deleteSource = async (sourceId) => {
    if (!confirm('Tem certeza que deseja remover esta fonte?')) return;

    try {
      const { error } = await supabase
        .from('rag_training_sources')
        .delete()
        .eq('id', sourceId);

      if (error) throw error;

      toast({
        title: '🗑️ Fonte removida',
        description: 'A fonte foi removida do treinamento.',
      });

      loadData();
    } catch (error) {
      console.error('Erro ao remover fonte:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    }
  };

  const processEmbeddings = async (sourceId) => {
    try {
      // Chamar edge function para processar embeddings
      const { data, error } = await supabase.functions.invoke('process-rag-embeddings', {
        body: { source_id: sourceId },
      });

      if (error) throw error;

      console.log('Processamento iniciado:', data);
    } catch (error) {
      console.error('Erro ao processar embeddings:', error);
      // Não bloquear o fluxo
    }
  };

  const reprocessSource = async (sourceId) => {
    try {
      const { error } = await supabase
        .from('rag_training_sources')
        .update({ embedding_status: 'pending' })
        .eq('id', sourceId);

      if (error) throw error;

      await processEmbeddings(sourceId);

      toast({
        title: '🔄 Reprocessando',
        description: 'A fonte será reprocessada em breve.',
      });

      loadData();
    } catch (error) {
      console.error('Erro ao reprocessar:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    }
  };

  const addMaterialToRAG = async (materialId) => {
    try {
      // Buscar material
      const material = materials.find((m) => m.id === materialId);
      if (!material) return;

      const { data, error } = await supabase
        .from('rag_training_sources')
        .insert({
          class_id: classId,
          material_id: materialId,
          file_name: material.title,
          file_url: material.file_url,
          file_type: material.file_type,
          is_active: false,
          embedding_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '✅ Material adicionado!',
        description: 'Será processado em breve.',
      });

      await processEmbeddings(data.id);
      loadData();
    } catch (error) {
      console.error('Erro:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    }
  };

  const addActivityToRAG = async (activityId) => {
    try {
      const activity = activities.find((a) => a.id === activityId);
      if (!activity) return;

      const { data, error } = await supabase
        .from('rag_training_sources')
        .insert({
          class_id: classId,
          activity_id: activityId,
          file_name: activity.title,
          file_type: 'activity',
          is_active: false,
          embedding_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: '✅ Atividade adicionada!',
        description: 'Será processada em breve.',
      });

      await processEmbeddings(data.id);
      loadData();
    } catch (error) {
      console.error('Erro:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fontes de Treinamento do Chatbot</CardTitle>
        <CardDescription>
          Selecione os materiais que o chatbot poderá usar para responder perguntas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sources" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sources">
              Fontes Ativas ({trainingSources.filter((s) => s.is_active).length})
            </TabsTrigger>
            <TabsTrigger value="materials">
              Materiais ({materials.length})
            </TabsTrigger>
            <TabsTrigger value="activities">
              Atividades ({activities.length})
            </TabsTrigger>
            <TabsTrigger value="upload">Upload/URL</TabsTrigger>
          </TabsList>

          {/* TAB: Fontes Ativas */}
          <TabsContent value="sources" className="space-y-3">
            {trainingSources.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma fonte adicionada ainda.
                <br />
                Use as outras abas para adicionar materiais.
              </div>
            ) : (
              trainingSources.map((source) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(source.embedding_status)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{source.file_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(source.embedding_status)}
                        {source.file_size && (
                          <span className="text-xs text-gray-500">
                            {(source.file_size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={source.is_active}
                      onCheckedChange={() => toggleSource(source.id, source.is_active)}
                      disabled={source.embedding_status !== 'completed'}
                    />
                    {source.embedding_status === 'failed' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => reprocessSource(source.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteSource(source.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* TAB: Materiais */}
          <TabsContent value="materials" className="space-y-3">
            {materials.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum material postado ainda.
              </div>
            ) : (
              materials.map((material) => {
                const isInRAG = trainingSources.some((s) => s.material_id === material.id);
                return (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-sm">{material.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(material.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    {isInRAG ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        No RAG
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addMaterialToRAG(material.id)}
                      >
                        Adicionar ao RAG
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </TabsContent>

          {/* TAB: Atividades */}
          <TabsContent value="activities" className="space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma atividade criada ainda.
              </div>
            ) : (
              activities.map((activity) => {
                const isInRAG = trainingSources.some((s) => s.activity_id === activity.id);
                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-sm">{activity.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    {isInRAG ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        No RAG
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addActivityToRAG(activity.id)}
                      >
                        Adicionar ao RAG
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </TabsContent>

          {/* TAB: Upload/URL */}
          <TabsContent value="upload" className="space-y-4">
            {/* Upload de Arquivo */}
            <div className="space-y-2">
              <Label>Upload de Arquivo</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="flex-1"
                />
                {uploading && (
                  <Progress value={uploadProgress} className="w-32" />
                )}
              </div>
              <p className="text-xs text-gray-500">
                Formatos aceitos: PDF, Word, PowerPoint, TXT (max 50MB)
              </p>
            </div>

            {/* URL Externa */}
            <div className="space-y-2">
              <Label>URL Externa</Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://exemplo.com/artigo"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddExternalUrl} disabled={!externalUrl.trim()}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Adicione artigos, vídeos (YouTube) ou páginas web
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RAGMaterialsSelector;
