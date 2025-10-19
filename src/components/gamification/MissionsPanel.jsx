import React, { useEffect, useState } from 'react';
import { Target, CheckCircle2, Clock, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import missionsService from '@/services/missionsService';

const MissionCard = ({ mission }) => {
  const catalog = mission.missions_catalog;
  const progress = mission.progress || {};
  const rules = catalog.rules || {};
  
  const getProgressPercent = () => {
    const type = rules.type;
    
    switch (type) {
      case 'submit':
        return Math.min(100, ((progress.submissions || 0) / rules.count) * 100);
      case 'quiz':
        return Math.min(100, ((progress.quizzes || 0) / rules.count) * 100);
      case 'focus':
        const targetMin = rules.minutes || (rules.hours * 60);
        return Math.min(100, ((progress.minutes || 0) / targetMin) * 100);
      case 'perfect_scores':
        return Math.min(100, ((progress.perfect_scores || 0) / rules.count) * 100);
      case 'login':
        return progress.logged_in ? 100 : 0;
      case 'perfect_score':
      case 'early_submission':
        return (progress.perfect_scores || progress.early_submissions || 0) >= 1 ? 100 : 0;
      default:
        return 0;
    }
  };

  const getProgressText = () => {
    const type = rules.type;
    
    switch (type) {
      case 'submit':
        return `${progress.submissions || 0}/${rules.count}`;
      case 'quiz':
        return `${progress.quizzes || 0}/${rules.count}`;
      case 'focus':
        const targetMin = rules.minutes || (rules.hours * 60);
        return `${progress.minutes || 0}/${targetMin} min`;
      case 'perfect_scores':
        return `${progress.perfect_scores || 0}/${rules.count}`;
      case 'login':
        return progress.logged_in ? 'Completo!' : 'Pendente';
      default:
        return 'Em progresso';
    }
  };

  const progressPercent = getProgressPercent();
  const isCompleted = mission.status === 'completed' || progressPercent === 100;

  const timeLeft = () => {
    const resetAt = new Date(mission.reset_at);
    const now = new Date();
    const diff = resetAt - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return `${hours}h restantes`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d restantes`;
    }
  };

  return (
    <div className={`rounded-lg border p-4 transition-all ${
      isCompleted 
        ? 'border-green-500/30 bg-green-500/5' 
        : 'border-border/50 bg-card hover:shadow-md'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Target className="h-5 w-5 text-primary" />
            )}
            <h4 className="font-semibold">{catalog.name}</h4>
          </div>
          
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              +{catalog.reward_xp} XP
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeLeft()}
            </span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-medium">{getProgressText()}</div>
          {!isCompleted && (
            <div className="mt-1 text-xs text-muted-foreground">
              {Math.round(progressPercent)}%
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {!isCompleted && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
};

const MissionsPanel = () => {
  const { user } = useAuth();
  const [dailyMissions, setDailyMissions] = useState([]);
  const [weeklyMissions, setWeeklyMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    const loadMissions = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        
        // Inicializar missões se necessário
        await missionsService.initializeMissions(user.id);
        
        // Buscar missões
        const daily = await missionsService.getUserMissions(user.id, 'daily');
        const weekly = await missionsService.getUserMissions(user.id, 'weekly');
        
        setDailyMissions(daily);
        setWeeklyMissions(weekly);
      } catch (error) {
        console.error('Error loading missions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMissions();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  const missions = activeTab === 'daily' ? dailyMissions : weeklyMissions;
  const completedCount = missions.filter(m => m.status === 'completed').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Missões</h3>
        </div>
        
        <div className="flex rounded-lg border border-border bg-muted p-1">
          <button
            onClick={() => setActiveTab('daily')}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              activeTab === 'daily'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Diárias
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
              activeTab === 'weekly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Semanais
          </button>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="rounded-lg border border-border/50 bg-gradient-to-r from-primary/5 to-purple-500/5 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">
              {activeTab === 'daily' ? 'Missões Diárias' : 'Missões Semanais'}
            </div>
            <div className="text-2xl font-bold">
              {completedCount}/{missions.length} completas
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {Math.round((completedCount / missions.length) * 100) || 0}%
            </div>
            <div className="text-xs text-muted-foreground">Progresso</div>
          </div>
        </div>
      </div>

      {/* Missions List */}
      <div className="space-y-3">
        {missions.length === 0 ? (
          <div className="rounded-lg border border-border/50 bg-card p-8 text-center text-muted-foreground">
            Nenhuma missão disponível no momento.
          </div>
        ) : (
          missions.map(mission => (
            <MissionCard key={mission.mission_id} mission={mission} />
          ))
        )}
      </div>
    </div>
  );
};

export default MissionsPanel;
