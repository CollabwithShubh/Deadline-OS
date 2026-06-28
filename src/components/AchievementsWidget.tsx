import React from 'react';
import { useApp } from '../context/AppContext';
import { Award, Check, Lock, Star, Zap, Flame, Compass, Clock, AwardIcon } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: React.ComponentType<any>;
  progress: number; // 0 to 100
  unlocked: boolean;
  metricLabel: string;
}

export const AchievementsWidget: React.FC = () => {
  const { tasks, focusSession } = useApp();

  // Dynamically calculate achievements from actual user database items
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const criticalCompleted = completedTasks.filter(t => t.priority === 'critical' || t.priority === 'high').length;
  const totalFocusTimeMins = focusSession.totalFocusTime || 0;

  // Let's seed some focus session stats if they are empty
  const hasFocusSession = focusSession.completedSessions > 0 || totalFocusTimeMins > 0;

  const achievementsList: Achievement[] = [
    {
      id: 'deadline_destroyer',
      name: 'Deadline Destroyer',
      desc: 'Complete 3 critical or high-priority tasks',
      icon: Flame,
      progress: Math.min(100, Math.round((criticalCompleted / 3) * 100)),
      unlocked: criticalCompleted >= 3,
      metricLabel: `${criticalCompleted}/3 critical tasks`
    },
    {
      id: 'deep_work_master',
      name: 'Deep Work Master',
      desc: 'Accumulate 60+ minutes of active focus time',
      icon: Clock,
      progress: Math.min(100, Math.round((totalFocusTimeMins / 60) * 100)),
      unlocked: totalFocusTimeMins >= 60,
      metricLabel: `${totalFocusTimeMins}/60 mins focus`
    },
    {
      id: 'recovery_hero',
      name: 'Recovery Hero',
      desc: 'Complete a task that was originally rated high risk',
      icon: Compass,
      progress: completedTasks.some(t => t.risk === 'high') ? 100 : 0,
      unlocked: completedTasks.some(t => t.risk === 'high'),
      metricLabel: completedTasks.some(t => t.risk === 'high') ? 'High-risk task resolved' : 'No high-risk task completed yet'
    },
    {
      id: 'focus_legend',
      name: 'Focus Legend',
      desc: 'Complete at least 3 deep focus sessions',
      icon: Zap,
      progress: Math.min(100, Math.round((focusSession.completedSessions / 3) * 100)),
      unlocked: focusSession.completedSessions >= 3,
      metricLabel: `${focusSession.completedSessions}/3 sessions`
    },
    {
      id: 'execution_machine',
      name: 'Execution Machine',
      desc: 'Complete 5+ total tasks in your backlog',
      icon: Award,
      progress: Math.min(100, Math.round((completedTasks.length / 5) * 100)),
      unlocked: completedTasks.length >= 5,
      metricLabel: `${completedTasks.length}/5 total tasks`
    }
  ];

  return (
    <div className="border border-zinc-900 bg-zinc-950/20 p-5 rounded-2xl space-y-4 font-sans">
      <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
        <Award size={14} className="text-yellow-500 animate-pulse" />
        <h3 className="font-sans font-bold text-xs text-zinc-200 uppercase tracking-wider">Neural Achievement Matrix</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {achievementsList.map((ach) => {
          const Icon = ach.icon;
          return (
            <div 
              key={ach.id} 
              className={`p-3.5 rounded-xl border flex gap-3 transition-all relative overflow-hidden ${
                ach.unlocked 
                  ? 'bg-yellow-500/5 border-yellow-500/25' 
                  : 'bg-zinc-950/40 border-zinc-900'
              }`}
            >
              {ach.unlocked && (
                <div className="absolute top-0 right-0 w-16 h-full bg-yellow-500/5 blur-[25px] rounded-full pointer-events-none" />
              )}
              
              {/* Badge Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                ach.unlocked 
                  ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_12px_rgba(234,179,8,0.1)]' 
                  : 'bg-zinc-900/60 text-zinc-500 border-zinc-800'
              }`}>
                <Icon size={18} />
              </div>

              {/* Badges details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[11px] font-bold block truncate leading-none ${ach.unlocked ? 'text-yellow-400' : 'text-zinc-400'}`}>
                    {ach.name}
                  </span>
                  {ach.unlocked ? (
                    <span className="p-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-[8px] flex items-center justify-center shrink-0">
                      <Check size={8} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="text-zinc-650 text-[9px] flex items-center gap-0.5 font-mono">
                      <Lock size={8} />
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 leading-snug">{ach.desc}</p>
                
                {/* Micro progress line */}
                <div className="space-y-1 pt-1">
                  <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${ach.unlocked ? 'bg-yellow-500' : 'bg-zinc-700'}`} 
                      style={{ width: `${ach.progress}%` }}
                    />
                  </div>
                  <span className="font-mono text-[8px] text-zinc-500 block text-right">
                    {ach.metricLabel}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
