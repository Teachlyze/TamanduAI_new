import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { PremiumCard, PremiumButton, LoadingScreen, toast } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Target, Award, Calendar, Users, ArrowLeft, Save } from 'lucide-react';

const CreateMissionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    objective: '',
    xpReward: 50,
    classId: '',
    startDate: '',
    endDate: '',
    isActive: true,
    requirements: {
      minActivities: 0,
      minGrade: 0,
      specificActivities: [],
    },
  });

  useEffect(() => {
    loadClasses();
  }, [user?.id]);

  const loadClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, subject')
        .eq('created_by', user.id)
        .eq('is_active', true);

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar turmas.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({ title: 'Erro', description: 'Título é obrigatório.', variant: 'destructive' });
      return;
    }

    if (!formData.classId) {
      toast({ title: 'Erro', description: 'Selecione uma turma.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { data: mission, error } = await supabase
        .from('missions')
        .insert({
          title: formData.title,
          description: formData.description,
          objective: formData.objective,
          xp_reward: formData.xpReward,
          class_id: formData.classId,
          start_date: formData.startDate || null,
          end_date: formData.endDate || null,
          is_active: formData.isActive,
          requirements: formData.requirements,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Criar registros de student_missions para todos os alunos da turma
      const { data: students } = await supabase
        .from('class_members')
        .select('user_id')
        .eq('class_id', formData.classId)
        .eq('role', 'student');

      if (students && students.length > 0) {
        const studentMissions = students.map((s) => ({
          mission_id: mission.id,
          user_id: s.user_id,  // Coluna correta é user_id, não student_id
          progress: {},  // JSONB, não integer
          status: 'active',  // 'pending' não existe no CHECK constraint
          reset_at: null,
        }));

        // Usar UPSERT para evitar erro 409 com PRIMARY KEY (user_id, mission_id)
        await supabase
          .from('user_missions')
          .upsert(studentMissions, { onConflict: 'user_id,mission_id' });
      }

      toast({ title: 'Sucesso', description: 'Missão criada com sucesso!' });
      navigate('/dashboard/missions');
    } catch (error) {
      console.error('Erro ao criar missão:', error);
      toast({ title: 'Erro', description: 'Não foi possível criar a missão.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen message="Carregando..." />;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <PremiumButton variant="outline" size="sm" onClick={() => navigate('/dashboard/missions')} className="whitespace-nowrap inline-flex items-center gap-2 bg-white dark:bg-slate-900 text-foreground border-border rounded-lg">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </PremiumButton>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Nova Missão
            </h1>
            <p className="text-muted-foreground">Crie desafios para engajar seus alunos</p>
          </div>
        </div>
        <PremiumButton onClick={handleSave} loading={saving} className="bg-gradient-to-r from-orange-600 to-red-600 text-white whitespace-nowrap inline-flex items-center gap-2 shadow-lg font-semibold rounded-xl">
          <Save className="w-4 h-4" />
          <span>Criar Missão</span>
        </PremiumButton>
      </div>

      {/* Form */}
      <PremiumCard variant="elevated">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Informações da Missão</h2>
              <p className="text-sm text-muted-foreground">Configure os detalhes do desafio</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título da Missão *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Completar 5 atividades esta semana"
                className="bg-white dark:bg-slate-900 text-foreground border-border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o desafio..."
                className="min-h-[100px] bg-white dark:bg-slate-900 text-foreground border-border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Objetivo (visível para alunos)</label>
              <Input
                value={formData.objective}
                onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                placeholder="Ex: Entregar todas as atividades no prazo"
                className="bg-white dark:bg-slate-900 text-foreground border-border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-500" />
                  Recompensa XP
                </label>
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.xpReward}
                  onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 50 })}
                  className="bg-white dark:bg-slate-900 text-foreground border-border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  Turma *
                </label>
                <Select value={formData.classId} onValueChange={(value) => setFormData({ ...formData, classId: value })}>
                  <SelectTrigger className="bg-white dark:bg-slate-900 text-foreground border-border rounded-lg">
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} - {c.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  Data de Início
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="bg-white dark:bg-slate-900 text-foreground border-border rounded-lg"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-500" />
                  Data de Término
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="bg-white dark:bg-slate-900 text-foreground border-border rounded-lg"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-lg font-semibold mb-4">Requisitos (opcional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mínimo de Atividades</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.requirements.minActivities}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requirements: { ...formData.requirements, minActivities: parseInt(e.target.value) || 0 },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nota Mínima</label>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={formData.requirements.minGrade}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        requirements: { ...formData.requirements, minGrade: parseFloat(e.target.value) || 0 },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-green-50 dark:bg-green-950/20">
              <div>
                <label className="text-sm font-medium">Missão Ativa</label>
                <p className="text-xs text-muted-foreground">Alunos podem começar a trabalhar nesta missão</p>
              </div>
              <Switch checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })} />
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Preview */}
      <PremiumCard variant="elevated">
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4">Preview da Missão</h3>
          <div className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-xl font-bold text-orange-600">{formData.title || 'Título da Missão'}</h4>
                <p className="text-sm text-muted-foreground mt-1">{formData.description || 'Descrição da missão...'}</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-lg">
                <Award className="w-5 h-5 text-yellow-600" />
                <span className="font-bold text-yellow-600">{formData.xpReward} XP</span>
              </div>
            </div>
            {formData.objective && (
              <div className="bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                <div className="text-sm font-medium">🎯 Objetivo:</div>
                <div className="text-sm mt-1">{formData.objective}</div>
              </div>
            )}
            {(formData.startDate || formData.endDate) && (
              <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                {formData.startDate && <span>Início: {new Date(formData.startDate).toLocaleDateString('pt-BR')}</span>}
                {formData.endDate && <span>Fim: {new Date(formData.endDate).toLocaleDateString('pt-BR')}</span>}
              </div>
            )}
          </div>
        </div>
      </PremiumCard>
    </div>
  );
};

export default CreateMissionPage;
