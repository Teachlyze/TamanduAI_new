import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import gamificationService from '@/services/gamificationService';

const RankingItem = ({ rank, isCurrentUser }) => {
  const getMedalIcon = (position) => {
    if (position === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Medal className="h-5 w-5 text-orange-600" />;
    return <div className="h-5 w-5 text-center text-sm font-bold text-muted-foreground">{position}</div>;
  };

  const getPositionColor = (position) => {
    if (position === 1) return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
    if (position === 2) return 'from-gray-400/20 to-gray-500/20 border-gray-400/30';
    if (position === 3) return 'from-orange-500/20 to-orange-600/20 border-orange-500/30';
    return 'from-card to-card border-border/50';
  };

  return (
    <div
      className={`flex items-center gap-4 rounded-lg border bg-gradient-to-r p-4 transition-all ${
        isCurrentUser ? 'ring-2 ring-primary ring-offset-2' : ''
      } ${getPositionColor(rank.position)}`}
    >
      <div className="flex-shrink-0">{getMedalIcon(rank.position)}</div>
      
      <div className="flex-1">
        <div className="font-semibold">
          {rank.user_name}
          {isCurrentUser && (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              Você
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground">Nível {rank.level}</div>
      </div>
      
      <div className="text-right">
        <div className="font-bold text-primary">{rank.xp.toLocaleString()} XP</div>
      </div>
    </div>
  );
};

const ClassRanking = ({ classId, className }) => {
  const { user } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [period, setPeriod] = useState('weekly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRanking = async () => {
      if (!classId) return;

      try {
        setLoading(true);
        const data = await gamificationService.getClassRanking(classId, period);
        setRanking(data);
      } catch (error) {
        console.error('Error loading ranking:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, [classId, period]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!ranking || ranking.length === 0) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card p-8 text-center">
        <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">
          Ainda não há dados de ranking para esta turma.
        </p>
      </div>
    );
  }

  const currentUserRank = ranking.find(r => r.user_id === user?.id);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold">
            Ranking {className ? `- ${className}` : ''}
          </h3>
        </div>
        
        {/* Period Toggle */}
        <div className="flex rounded-lg border border-border bg-muted p-1">
          <button
            onClick={() => setPeriod('weekly')}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              period === 'weekly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Semanal
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              period === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Mensal
          </button>
        </div>
      </div>

      {/* Current User Position (if not in top 10) */}
      {currentUserRank && currentUserRank.position > 10 && (
        <div className="rounded-lg border border-primary/50 bg-primary/5 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Sua posição:</span>
            <span className="font-bold text-primary">#{currentUserRank.position}</span>
          </div>
        </div>
      )}

      {/* Ranking List */}
      <div className="space-y-3">
        {ranking.slice(0, 10).map(rank => (
          <RankingItem
            key={rank.user_id}
            rank={rank}
            isCurrentUser={rank.user_id === user?.id}
          />
        ))}
      </div>

      {ranking.length > 10 && (
        <div className="text-center text-sm text-muted-foreground">
          Mostrando top 10 de {ranking.length} alunos
        </div>
      )}
    </div>
  );
};

export default ClassRanking;
