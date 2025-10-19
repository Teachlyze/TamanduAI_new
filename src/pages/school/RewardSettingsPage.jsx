import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabaseClient';
import { PremiumCard, PremiumButton, LoadingScreen, EmptyState, toast } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Award, Gift, Plus, Trash2, Edit, TrendingUp, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const RewardSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState(null);

  const [formData, setFormData] = useState({
    reward_type: 'top_rank_bonus',
    reward_name: '',
    reward_description: '',
    reward_value: 0,
    reward_xp: 0,
    scope: 'school',
    is_active: true,
    conditions: {},
  });

  useEffect(() => {
    loadRewards();
  }, [user?.id]);

  const loadRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('reward_settings')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Erro ao carregar recompensas:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar as recompensas.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.reward_name.trim()) {
      toast({ title: 'Erro', description: 'Nome da recompensa é obrigatório.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const rewardData = {
        ...formData,
        created_by: user.id,
        scope_id: null, // For now, school-wide
      };

      if (editingReward) {
        const { error } = await supabase.from('reward_settings').update(rewardData).eq('id', editingReward.id);
        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Recompensa atualizada!' });
      } else {
        const { error } = await supabase.from('reward_settings').insert(rewardData);
        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Recompensa criada!' });
      }

      resetForm();
      loadRewards();
    } catch (error) {
      console.error('Erro ao salvar recompensa:', error);
      toast({ title: 'Erro', description: 'Não foi possível salvar a recompensa.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta recompensa?')) return;

    try {
      const { error } = await supabase.from('reward_settings').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Recompensa excluída!' });
      loadRewards();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({ title: 'Erro', description: 'Não foi possível excluir.', variant: 'destructive' });
    }
  };

  const handleEdit = (reward) => {
    setEditingReward(reward);
    setFormData({
      reward_type: reward.reward_type,
      reward_name: reward.reward_name,
      reward_description: reward.reward_description || '',
      reward_value: reward.reward_value || 0,
      reward_xp: reward.reward_xp || 0,
      scope: reward.scope,
      is_active: reward.is_active,
      conditions: reward.conditions || {},
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      reward_type: 'top_rank_bonus',
      reward_name: '',
      reward_description: '',
      reward_value: 0,
      reward_xp: 0,
      scope: 'school',
      is_active: true,
      conditions: {},
    });
    setEditingReward(null);
    setShowForm(false);
  };

  const rewardTypeLabels = {
    top_rank_bonus: '🏆 Bônus Top Ranking',
    streak_bonus: '🔥 Bônus de Sequência',
    perfect_score: '⭐ Nota Perfeita',
    mission_complete: '✅ Missão Completa',
    custom: '🎁 Personalizado',
  };

  const rewardTypeDescriptions = {
    top_rank_bonus: 'Recompensa para alunos no top do ranking',
    streak_bonus: 'Recompensa por dias consecutivos de atividade',
    perfect_score: 'Recompensa por nota 10 em atividades',
    mission_complete: 'Recompensa ao completar missões',
    custom: 'Recompensa personalizada com critérios próprios',
  };

  if (loading) return <LoadingScreen message="Carregando recompensas..." />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-8 rounded-2xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
              <Gift className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Configurações de Recompensas</h1>
              <p className="text-white/90 mt-1">Crie incentivos personalizados para seus alunos</p>
            </div>
          </div>
          <PremiumButton onClick={() => setShowForm(true)} className="bg-white text-orange-600 hover:bg-white/90 whitespace-nowrap inline-flex items-center gap-2 shadow-lg font-semibold border-2 border-white/20">
            <Plus className="w-4 h-4" />
            <span>Nova Recompensa</span>
          </PremiumButton>
        </div>
      </div>

      {/* Suggested Rewards */}
      <PremiumCard variant="elevated">
        <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
          <h3 className="text-lg font-bold mb-4">💡 Sugestões de Recompensas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-black/20 rounded-lg">
              <div className="text-2xl mb-2">🏆</div>
              <h4 className="font-semibold mb-1">Top 10 no Ranking</h4>
              <p className="text-sm text-muted-foreground">Alunos no top 10 ganham +1 ponto na média final</p>
            </div>
            <div className="p-4 bg-white dark:bg-black/20 rounded-lg">
              <div className="text-2xl mb-2">🔥</div>
              <h4 className="font-semibold mb-1">7 Dias de Sequência</h4>
              <p className="text-sm text-muted-foreground">Estudar 7 dias seguidos garante 100 XP de bônus</p>
            </div>
            <div className="p-4 bg-white dark:bg-black/20 rounded-lg">
              <div className="text-2xl mb-2">⭐</div>
              <h4 className="font-semibold mb-1">Nota 10 Perfeita</h4>
              <p className="text-sm text-muted-foreground">Tirar 10 em uma atividade ganha 50 XP extra</p>
            </div>
          </div>
        </div>
      </PremiumCard>

      {/* Form */}
      {showForm && (
        <PremiumCard variant="elevated">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingReward ? 'Editar Recompensa' : 'Nova Recompensa'}</h2>
              <PremiumButton variant="ghost" size="sm" onClick={resetForm} className="whitespace-nowrap inline-flex items-center gap-2 text-black dark:text-white">
                <span>Cancelar</span>
              </PremiumButton>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Recompensa *</label>
                <Select value={formData.reward_type} onValueChange={(value) => setFormData({ ...formData, reward_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(rewardTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">{rewardTypeDescriptions[formData.reward_type]}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome da Recompensa *</label>
                  <Input
                    value={formData.reward_name}
                    onChange={(e) => setFormData({ ...formData, reward_name: e.target.value })}
                    placeholder="Ex: Bônus Top 10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Escopo</label>
                  <Select value={formData.scope} onValueChange={(value) => setFormData({ ...formData, scope: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school">🏫 Toda a Escola</SelectItem>
                      <SelectItem value="class">📚 Por Turma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <Textarea
                  value={formData.reward_description}
                  onChange={(e) => setFormData({ ...formData, reward_description: e.target.value })}
                  placeholder="Descreva como os alunos podem ganhar esta recompensa..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Valor da Recompensa (pontos na média)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.reward_value}
                    onChange={(e) => setFormData({ ...formData, reward_value: parseFloat(e.target.value) || 0 })}
                    placeholder="0.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Pontos adicionados na média final</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">XP de Bônus</label>
                  <Input
                    type="number"
                    value={formData.reward_xp}
                    onChange={(e) => setFormData({ ...formData, reward_xp: parseInt(e.target.value) || 0 })}
                    placeholder="50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">XP extra concedido</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <label className="text-sm font-medium">Recompensa Ativa</label>
                  <p className="text-xs text-muted-foreground">Os alunos podem ganhar esta recompensa agora</p>
                </div>
                <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
              </div>

              <div className="flex gap-3 pt-4">
                <PremiumButton type="submit" className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 whitespace-nowrap inline-flex items-center justify-center gap-2" loading={saving}>
                  <span>{editingReward ? 'Atualizar' : 'Criar'} Recompensa</span>
                </PremiumButton>
                <PremiumButton type="button" variant="outline" onClick={resetForm} className="whitespace-nowrap inline-flex items-center gap-2">
                  <span>Cancelar</span>
                </PremiumButton>
              </div>
            </form>
          </div>
        </PremiumCard>
      )}

      {/* Rewards List */}
      <PremiumCard variant="elevated">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Recompensas Criadas ({rewards.length})</h2>
          {rewards.length === 0 ? (
            <EmptyState
              icon={Gift}
              title="Nenhuma recompensa criada"
              description="Crie recompensas para motivar e incentivar seus alunos!"
              action={
                <PremiumButton onClick={() => setShowForm(true)} className="whitespace-nowrap inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Criar Primeira Recompensa</span>
                </PremiumButton>
              }
            />
          ) : (
            <div className="space-y-3">
              {rewards.map((reward) => (
                <div key={reward.id} className="p-4 border border-border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{reward.reward_name}</h3>
                        <Badge variant={reward.is_active ? 'default' : 'secondary'}>
                          {reward.is_active ? 'Ativa' : 'Inativa'}
                        </Badge>
                        <Badge variant="outline">{rewardTypeLabels[reward.reward_type]}</Badge>
                      </div>
                      {reward.reward_description && <p className="text-sm text-muted-foreground mb-3">{reward.reward_description}</p>}
                      <div className="flex items-center gap-6 text-sm">
                        {reward.reward_value > 0 && (
                          <span className="flex items-center gap-1 text-blue-600">
                            <TrendingUp className="w-4 h-4" />
                            +{reward.reward_value} pontos na média
                          </span>
                        )}
                        {reward.reward_xp > 0 && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Award className="w-4 h-4" />
                            +{reward.reward_xp} XP
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          Escopo: {reward.scope === 'school' ? '🏫 Escola' : '📚 Turma'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <PremiumButton variant="ghost" size="sm" onClick={() => handleEdit(reward)}>
                        <Edit className="w-4 h-4" />
                      </PremiumButton>
                      <PremiumButton variant="ghost" size="sm" onClick={() => handleDelete(reward.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </PremiumButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PremiumCard>

      {/* Info Card */}
      <PremiumCard variant="elevated">
        <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <h3 className="text-lg font-bold mb-4">ℹ️ Como as Recompensas Funcionam?</h3>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Pontos na Média:</strong> São adicionados automaticamente à média final do aluno quando ele atinge o critério.
            </p>
            <p>
              <strong>XP de Bônus:</strong> XP extra concedido imediatamente ao atingir o objetivo.
            </p>
            <p>
              <strong>Escopo Escola:</strong> Válido para todos os alunos da escola.
            </p>
            <p>
              <strong>Escopo Turma:</strong> Válido apenas para alunos de uma turma específica.
            </p>
            <p className="text-yellow-700 dark:text-yellow-400">
              <strong>💡 Dica:</strong> Use recompensas para incentivar comportamentos positivos como pontualidade, participação e dedicação!
            </p>
          </div>
        </div>
      </PremiumCard>
    </div>
  );
};

export default RewardSettingsPage;
