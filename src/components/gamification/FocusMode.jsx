import React, { useEffect, useState } from 'react';
import { Play, Pause, Square, Coffee, Clock, Zap, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import focusService from '@/services/focusService';

const FocusMode = () => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState(null);
  const [selectedTechnique, setSelectedTechnique] = useState('pomodoro25');
  const [timeLeft, setTimeLeft] = useState(0); // seconds remaining
  const [isBreak, setIsBreak] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const configs = focusService.getConfigs();

  useEffect(() => {
    loadStats();
    checkActiveSession();
  }, [user?.id]);

  useEffect(() => {
    if (!activeSession) return;

    const tick = () => {
      const now = new Date();
      const startedAt = new Date(activeSession.session.started_at);
      const elapsedSec = Math.floor((now - startedAt) / 1000);
      const config = configs[activeSession.session.technique];

      const workSec = (config.work || 0) * 60;
      const breakSec = (config.break || 0) * 60;

      let remainingSec = 0;
      if (!isBreak) {
        remainingSec = workSec - elapsedSec;
        if (remainingSec <= 0) {
          setIsBreak(true);
          playSound('complete');
          remainingSec = breakSec; // start break countdown
        }
      } else {
        const breakElapsedSec = elapsedSec - workSec;
        remainingSec = breakSec - breakElapsedSec;
        if (remainingSec <= 0) {
          endSession();
          remainingSec = 0;
        }
      }

      setTimeLeft(Math.max(0, remainingSec));
    };

    const interval = setInterval(tick, 1000);
    tick();
    return () => clearInterval(interval);
  }, [activeSession, isBreak]);

  const loadStats = async () => {
    if (!user?.id) return;

    try {
      const data = await focusService.getStats(user.id);
      setStats(data);
    } catch (error) {
      console.error('Error loading focus stats:', error);
    }
  };

  const checkActiveSession = async () => {
    if (!user?.id) return;

    try {
      const session = await focusService.getActiveSession(user.id);
      if (session) {
        setActiveSession(session);
        setSelectedTechnique(session.session.technique);
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  };

  const startSession = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const result = await focusService.startSession(user.id, selectedTechnique);
      setActiveSession(result);
      setIsBreak(false);
      setTimeLeft((result.config.work || 0) * 60);
      playSound('start');
    } catch (error) {
      console.error('Error starting session:', error);
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!activeSession || !user?.id) return;

    try {
      setLoading(true);
      const result = await focusService.endSession(activeSession.session.id, user.id);
      
      setActiveSession(null);
      setIsBreak(false);
      setTimeLeft(0);
      
      await loadStats();
      
      if (result.completed && result.xp_earned > 0) {
        playSound('success');
        // Show XP notification (pode implementar toast)
        console.log(`🎉 +${result.xp_earned} XP por completar sessão de foco!`);
      }
    } catch (error) {
      console.error('Error ending session:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelSession = async () => {
    if (!activeSession || !user?.id) return;

    try {
      await focusService.cancelSession(activeSession.session.id, user.id);
      setActiveSession(null);
      setIsBreak(false);
      setTimeLeft(0);
    } catch (error) {
      console.error('Error canceling session:', error);
    }
  };

  const playSound = (type) => {
    // Implementar sons (opcional)
    console.log(`Sound: ${type}`);
  };

  const formatTime = (seconds) => {
    const sec = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Timer Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 p-8 shadow-lg">
        <div className="text-center">
          {activeSession ? (
            <>
              <div className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {isBreak ? '☕ Pausa' : '🎯 Focando'}
              </div>
              <div className="text-7xl font-bold tabular-nums">
                {formatTime(timeLeft)}
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {configs[activeSession.session.technique].label}
              </div>
              
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={endSession}
                  disabled={loading}
                  className="rounded-lg bg-green-600 px-6 py-3 font-medium text-slate-900 dark:text-white hover:bg-green-700 disabled:opacity-50"
                >
                  <Square className="inline h-4 w-4 mr-2" />
                  Finalizar
                </button>
                <button
                  onClick={cancelSession}
                  disabled={loading}
                  className="rounded-lg border border-border bg-background px-6 py-3 font-medium hover:bg-muted"
                >
                  Cancelar
                </button>
              </div>
            </>
          ) : (
            <>
              <Clock className="mx-auto h-16 w-16 text-primary" />
              <h3 className="mt-4 text-2xl font-bold">Modo Foco</h3>
              <p className="mt-2 text-muted-foreground">
                Escolha uma técnica Pomodoro e comece a focar
              </p>

              {/* Technique Selector */}
              <div className="mt-6 space-y-3">
                {Object.entries(configs).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTechnique(key)}
                    className={`w-full rounded-lg border p-4 text-left transition-all ${
                      selectedTechnique === key
                        ? 'border-primary bg-primary/10 ring-2 ring-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{config.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {config.work} min foco + {config.break} min pausa
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-primary">
                        <Zap className="h-4 w-4" />
                        +{config.xp} XP
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={startSession}
                disabled={loading}
                className="mt-6 w-full rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Play className="mr-2 inline h-5 w-5" />
                Iniciar Sessão
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h4 className="text-lg font-semibold">Estatísticas</h4>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <div className="text-sm text-muted-foreground">Total Sessões</div>
              <div className="text-2xl font-bold">{stats.total_sessions}</div>
            </div>
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <div className="text-sm text-muted-foreground">Total Horas</div>
              <div className="text-2xl font-bold">{stats.total_hours}h</div>
            </div>
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <div className="text-sm text-muted-foreground">XP Hoje</div>
              <div className="text-2xl font-bold text-primary">{stats.daily_xp_earned}</div>
            </div>
            <div className="rounded-lg border border-border/50 bg-card p-4">
              <div className="text-sm text-muted-foreground">XP Restante</div>
              <div className="text-2xl font-bold text-green-600">{stats.daily_xp_remaining}</div>
            </div>
          </div>

          {/* Daily XP Progress */}
          <div className="rounded-lg border border-border/50 bg-card p-4">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">XP Diário ({stats.daily_xp_limit} limite)</span>
              <span className="font-medium">
                {stats.daily_xp_earned}/{stats.daily_xp_limit}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all"
                style={{ width: `${(stats.daily_xp_earned / stats.daily_xp_limit) * 100}%` }}
              />
            </div>
          </div>

          {/* By Technique */}
          <div className="rounded-lg border border-border/50 bg-card p-4">
            <div className="mb-3 text-sm font-medium">Por Técnica</div>
            <div className="space-y-2">
              {Object.entries(stats.by_technique).map(([key, count]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{configs[key]?.label}</span>
                  <span className="font-medium">{count} sessões</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusMode;
