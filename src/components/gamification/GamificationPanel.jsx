import React, { useEffect, useState } from 'react';
import { Trophy, Zap, TrendingUp, Award, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import gamificationService from '@/services/gamificationService';

const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => (
  <div className={`rounded-xl border border-border/50 bg-gradient-to-br from-${color}-500/5 to-${color}-600/5 p-4 shadow-sm`}>
    <div className="flex items-center gap-3">
      <div className={`rounded-lg bg-${color}-500/10 p-2`}>
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  </div>
);

const BadgeItem = ({ badge }) => (
  <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 p-2">
    <div className="text-2xl">{badge.badges_catalog?.name?.match(/[\u{1F300}-\u{1F9FF}]/u)?.[0] || '🏅'}</div>
    <div className="flex-1">
      <div className="text-sm font-medium">{badge.badges_catalog?.name?.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()}</div>
      <div className="text-xs text-muted-foreground">
        {new Date(badge.granted_at).toLocaleDateString('pt-BR')}
      </div>
    </div>
  </div>
);

const GamificationPanel = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const data = await gamificationService.getProfile(user.id);
        setProfile(data);
      } catch (error) {
        console.error('Error loading gamification profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-6 text-center">
        <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">
          Complete sua primeira atividade para começar sua jornada de gamificação!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 p-6 text-white shadow-lg">
        <div className="absolute right-0 top-0 h-32 w-32 opacity-20">
          <Star className="h-32 w-32" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium opacity-90">Nível {profile.level}</div>
              <div className="mt-1 text-3xl font-bold">{profile.xp_total.toLocaleString()} XP</div>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Próximo nível</div>
              <div className="mt-1 text-xl font-bold">
                {profile.xp_for_next_level?.toLocaleString()} XP
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs">
              <span>Progresso</span>
              <span>{profile.progress_to_next_level}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500 transition-all duration-500"
                style={{ width: `${profile.progress_to_next_level}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon={Trophy}
          label="Nível"
          value={profile.level}
          color="purple"
        />
        <StatCard
          icon={Zap}
          label="XP Total"
          value={profile.xp_total.toLocaleString()}
          color="yellow"
        />
        <StatCard
          icon={TrendingUp}
          label="Streak Atual"
          value={`${profile.current_streak} dias`}
          color="orange"
        />
        <StatCard
          icon={Award}
          label="Badges"
          value={profile.badges?.length || 0}
          color="blue"
        />
      </div>

      {/* Badges Section */}
      {profile.badges && profile.badges.length > 0 && (
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Badges Conquistados</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {profile.badges.slice(0, 6).map((badge, idx) => (
              <BadgeItem key={idx} badge={badge} />
            ))}
          </div>
          {profile.badges.length > 6 && (
            <button className="mt-4 w-full rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted">
              Ver todos os {profile.badges.length} badges
            </button>
          )}
        </div>
      )}

      {/* Streak Info */}
      <div className="rounded-2xl border border-border/50 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-2xl">🔥</div>
              <div>
                <div className="font-semibold">Sequência de {profile.current_streak} dias</div>
                <div className="text-sm text-muted-foreground">
                  Seu recorde: {profile.longest_streak} dias
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Continue ativo para manter!</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamificationPanel;
