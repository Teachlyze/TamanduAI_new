import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { PremiumCard, LoadingScreen, EmptyState, PremiumButton, toast } from '@/components/ui';
import { Bot, Upload, FileText, BookOpen, CheckCircle } from 'lucide-react';

const TeacherChatbotSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [materials, setMaterials] = useState([]);
  const [activities, setActivities] = useState([]);
  const [ragSources, setRagSources] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState(new Set());
  const [selectedActivities, setSelectedActivities] = useState(new Set());
  const [uploading, setUploading] = useState(false);
  const [training, setTraining] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const { data: cls } = await supabase
          .from('classes')
          .select('id, name')
          .eq('created_by', user.id)
          .eq('is_active', true);
        setClasses(cls || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  useEffect(() => {
    if (!selectedClass) {
      setMaterials([]);
      setActivities([]);
      setRagSources([]);
      return;
    }
    const loadClassData = async () => {
      // Materials
      const { data: mats } = await supabase
        .from('class_materials')
        .select('id, title, file_url, file_type')
        .eq('class_id', selectedClass);
      setMaterials(mats || []);

      // Activities
      const { data: acts } = await supabase
        .from('activity_class_assignments')
        .select('activity:activities(id, title, description, instructions)')
        .eq('class_id', selectedClass);
      setActivities((acts || []).map((a) => a.activity).filter(Boolean));

      // RAG sources already registered
      const { data: rags } = await supabase
        .from('rag_training_sources')
        .select('id, file_name, file_type, embedding_status, material_id, activity_id')
        .eq('class_id', selectedClass)
        .eq('is_active', true);
      setRagSources(rags || []);

      // Pre-select already trained sources
      const trainedMats = new Set(rags.filter((r) => r.material_id).map((r) => r.material_id));
      const trainedActs = new Set(rags.filter((r) => r.activity_id).map((r) => r.activity_id));
      setSelectedMaterials(trainedMats);
      setSelectedActivities(trainedActs);
    };
    loadClassData();
  }, [selectedClass]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClass) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${selectedClass}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from('materials').upload(path, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('materials').getPublicUrl(path);
      const file_url = urlData?.publicUrl || null;

      // Insert into class_materials
      const { data: mat, error: matErr } = await supabase
        .from('class_materials')
        .insert({
          class_id: selectedClass,
          title: file.name,
          file_url,
          file_type: ext,
          file_size: file.size,
          uploaded_by: user.id,
          created_by: user.id,
        })
        .select()
        .maybeSingle();
      if (matErr) throw matErr;

      setMaterials((m) => [...m, mat]);
      toast.success?.('Material enviado com sucesso!');
    } catch (e) {
      console.error('Erro ao enviar material:', e);
      toast.error?.('Erro ao enviar material');
    } finally {
      setUploading(false);
    }
  };

  const handleTrain = async () => {
    if (!selectedClass) return;
    setTraining(true);
    try {
      const newSources = [];
      // Materials
      for (const matId of selectedMaterials) {
        const mat = materials.find((m) => m.id === matId);
        if (!mat) continue;
        const exists = ragSources.find((r) => r.material_id === matId);
        if (!exists) {
          newSources.push({
            class_id: selectedClass,
            material_id: matId,
            file_url: mat.file_url,
            file_name: mat.title,
            file_type: mat.file_type,
            added_by: user.id,
            embedding_status: 'pending',
          });
        }
      }

      // Activities
      for (const actId of selectedActivities) {
        const act = activities.find((a) => a.id === actId);
        if (!act) continue;
        const exists = ragSources.find((r) => r.activity_id === actId);
        if (!exists) {
          // Create a pseudo file_url for activity content
          newSources.push({
            class_id: selectedClass,
            activity_id: actId,
            file_url: `activity://${actId}`,
            file_name: act.title,
            file_type: 'text',
            added_by: user.id,
            embedding_status: 'pending',
            content_extracted: [act.description, act.instructions].filter(Boolean).join('\n'),
          });
        }
      }

      if (newSources.length > 0) {
        const { error } = await supabase.from('rag_training_sources').insert(newSources);
        if (error) throw error;
        toast.success?.(`${newSources.length} fontes adicionadas para treinamento!`);

        // Reload RAG sources
        const { data: rags } = await supabase
          .from('rag_training_sources')
          .select('id, file_name, file_type, embedding_status, material_id, activity_id')
          .eq('class_id', selectedClass)
          .eq('is_active', true);
        setRagSources(rags || []);
      } else {
        toast.success?.('Todas as fontes selecionadas já estão treinadas!');
      }
    } catch (e) {
      console.error('Erro ao treinar chatbot:', e);
      toast.error?.('Erro ao treinar chatbot');
    } finally {
      setTraining(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 rounded-2xl text-white">
        <h1 className="text-2xl font-bold flex items-center gap-3"><Bot className="w-6 h-6"/> Configurações do Chatbot</h1>
        <p className="text-slate-900 dark:text-white/90">Selecione a turma e os materiais para treinar o chatbot</p>
      </div>

      {/* Select Class */}
      <PremiumCard variant="elevated">
        <div className="p-6 space-y-3">
          <h2 className="text-lg font-bold">1. Selecione a Turma</h2>
          <select
            className="w-full px-4 py-3 rounded-lg border border-border bg-background"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Escolha uma turma --</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </PremiumCard>

      {selectedClass && (
        <>
          {/* Upload Material */}
          <PremiumCard variant="elevated">
            <div className="p-6 space-y-3">
              <h2 className="text-lg font-bold">2. Enviar Novo Material</h2>
              <div className="flex items-center gap-3">
                <input type="file" onChange={handleFileUpload} disabled={uploading} accept=".pdf,.doc,.docx,.txt" />
                <PremiumButton disabled={uploading} leftIcon={Upload}>
                  {uploading ? 'Enviando...' : 'Upload'}
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>

          {/* Select Materials */}
          <PremiumCard variant="elevated">
            <div className="p-6 space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2"><FileText className="w-5 h-5"/> 3. Selecione Materiais</h2>
              {materials.length === 0 ? (
                <EmptyState icon={FileText} title="Sem materiais" description="Envie materiais para esta turma." />
              ) : (
                <div className="space-y-2">
                  {materials.map((m) => (
                    <label key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMaterials.has(m.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedMaterials);
                          if (e.target.checked) newSet.add(m.id);
                          else newSet.delete(m.id);
                          setSelectedMaterials(newSet);
                        }}
                      />
                      <FileText className="w-4 h-4" />
                      <span className="flex-1">{m.title}</span>
                      {ragSources.find((r) => r.material_id === m.id) && <CheckCircle className="w-4 h-4 text-green-600" />}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </PremiumCard>

          {/* Select Activities */}
          <PremiumCard variant="elevated">
            <div className="p-6 space-y-3">
              <h2 className="text-lg font-bold flex items-center gap-2"><BookOpen className="w-5 h-5"/> 4. Selecione Atividades</h2>
              {activities.length === 0 ? (
                <EmptyState icon={BookOpen} title="Sem atividades" description="Crie atividades para esta turma." />
              ) : (
                <div className="space-y-2">
                  {activities.map((a) => (
                    <label key={a.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedActivities.has(a.id)}
                        onChange={(e) => {
                          const newSet = new Set(selectedActivities);
                          if (e.target.checked) newSet.add(a.id);
                          else newSet.delete(a.id);
                          setSelectedActivities(newSet);
                        }}
                      />
                      <BookOpen className="w-4 h-4" />
                      <span className="flex-1">{a.title}</span>
                      {ragSources.find((r) => r.activity_id === a.id) && <CheckCircle className="w-4 h-4 text-green-600" />}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </PremiumCard>

          {/* Train Button */}
          <PremiumCard variant="elevated">
            <div className="p-6">
              <PremiumButton
                variant="gradient"
                onClick={handleTrain}
                disabled={training || (selectedMaterials.size === 0 && selectedActivities.size === 0)}
                leftIcon={Bot}
                className="w-full"
              >
                {training ? 'Treinando...' : 'Treinar / Atualizar Chatbot'}
              </PremiumButton>
            </div>
          </PremiumCard>
        </>
      )}
    </div>
  );
};

export default TeacherChatbotSettingsPage;
