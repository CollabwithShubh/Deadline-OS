import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AIOperationsSuite } from '../components/AIOperationsSuite';
import { AchievementsWidget } from '../components/AchievementsWidget';
import { 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Timer, 
  AlertTriangle, 
  TrendingUp, 
  Zap, 
  Play, 
  Clock, 
  Check, 
  Cpu, 
  ChevronRight,
  LifeBuoy,
  X,
  RotateCw,
  Activity,
  Calendar,
  Bell,
  Brain,
  Sliders,
  LineChart,
  Heart,
  Compass
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { 
    user, 
    tasks, 
    productivityScore, 
    updateTask, 
    startFocusSession, 
    triggerRescueMode, 
    rescuePlan, 
    clearRescueMode,
    setCurrentPage,
    toggleSubtask,
    quickAddTask,
    notificationPermission,
    requestNotificationPermission,
    aiPersonality,
    dataSyncing
  } = useApp();

  const [isSuiteOpen, setIsSuiteOpen] = useState(false);
  const [suiteTab, setSuiteTab] = useState<'decision' | 'simulator' | 'diagnostics' | 'burnout' | 'meeting' | 'scenarios'>('decision');
  const [rescueInput, setRescueInput] = useState('');
  const [showRescueForm, setShowRescueForm] = useState(false);
  const [quickPrompt, setQuickPrompt] = useState('');
  const [parsingTask, setParsingTask] = useState(false);
  const [energyFilter, setEnergyFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // Filter tasks to show top action items
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const overdueCount = tasks.filter(t => t.status === 'overdue').length;

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPrompt.trim() || parsingTask) return;
    setParsingTask(true);
    await quickAddTask(quickPrompt);
    setParsingTask(false);
    setQuickPrompt('');
  };

  // Energy Sizer Filter Logic
  const energyFilteredTasks = activeTasks.filter(task => {
    // Check calendar filter first if selected
    if (selectedCalendarDate) {
      if (task.deadline !== selectedCalendarDate) return false;
    }
    
    if (energyFilter === 'all') return true;
    if (energyFilter === 'low') return task.priority === 'low' || task.priority === 'medium';
    if (energyFilter === 'medium') return task.priority === 'medium' || task.priority === 'high';
    if (energyFilter === 'high') return task.priority === 'high' || task.priority === 'critical';
    return true;
  });

  // Calendar dates timeline strip generator (last 2 days to next 4 days)
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = -2; i <= 4; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };
  const weekDates = getWeekDates();

  const getTasksCountForDate = (date: Date) => {
    const formatted = date.toISOString().split('T')[0];
    return tasks.filter(t => t.deadline === formatted && t.status !== 'completed').length;
  };

  const handleRescueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescueInput.trim()) return;
    triggerRescueMode(rescueInput);
    setRescueInput('');
    setShowRescueForm(false);
  };

  const handleCompleteTask = (task: typeof tasks[0]) => {
    updateTask({
      ...task,
      status: 'completed'
    });
  };

  // Generate an array representing a calendar heatmap (7 columns x 5 rows of productivity scores)
  const heatmapData = [
    [2, 0, 4, 1, 3, 2, 0],
    [1, 3, 2, 4, 0, 1, 2],
    [3, 0, 1, 2, 3, 4, 1],
    [0, 2, 3, 1, 2, 0, 4],
    [4, 1, 2, 3, 0, 2, 3]
  ];

  const getColorClassForHeatmap = (val: number) => {
    if (val === 0) return 'bg-zinc-950/80 border border-zinc-900/60';
    if (val === 1) return 'bg-blue-950/40 border border-blue-900/10 text-blue-900';
    if (val === 2) return 'bg-blue-900/30 border border-blue-800/20 text-blue-400';
    if (val === 3) return 'bg-blue-600/40 border border-blue-500/20 text-blue-300';
    return 'bg-gradient-to-tr from-blue-500 to-indigo-500 border border-blue-400/30 text-white';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div id="dashboard-viewport" className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto text-left">
      
      {/* GREETING UNIT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="space-y-1.5 z-10">
          <h1 className="text-4xl font-light tracking-tight text-white">{getGreeting()}, <span className="font-semibold">{user?.name || 'Operator'}.</span></h1>
          <p className="text-slate-400 mt-1">You have <span className="text-blue-400 font-medium">{activeTasks.length} critical deadlines</span> today. AI has optimized your schedule.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 z-10 shrink-0 font-mono text-xs">
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white font-bold">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-slate-400 text-[10px] mr-1">COMPLIANCE:</span>
            <span>{productivityScore}%</span>
          </div>
        </div>
      </div>

      {/* DESKTOP NOTIFICATIONS ACCESS BANNER */}
      {notificationPermission === 'default' && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-500/5 border border-amber-500/25 p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-full bg-amber-500/5 blur-[45px] rounded-full pointer-events-none" />
          <div className="flex gap-3 z-10 text-left">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20 shrink-0 h-fit">
              <Bell size={16} className="animate-bounce" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-amber-200 font-sans">Enable Desktop Alerts</h4>
              <p className="text-[11px] text-zinc-400 leading-normal max-w-xl font-sans">
                Get system-level alerts on your desktop whenever a task is completed, optimized, or requires urgent attention, even if working in another browser tab.
              </p>
            </div>
          </div>
          <button 
            onClick={requestNotificationPermission}
            className="z-10 bg-amber-500 hover:bg-amber-400 text-black font-sans font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            Grant Permission
          </button>
        </div>
      )}

      {/* AI NATURAL LANGUAGE QUICK TASK PARSER */}
      <div className="bg-gradient-to-r from-blue-950/20 to-purple-950/20 border border-blue-500/15 p-5 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-full bg-purple-500/5 blur-[60px] rounded-full pointer-events-none" />
        
        <form onSubmit={handleQuickAddSubmit} className="space-y-3.5 relative z-10">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-purple-400" />
            <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider font-semibold">AI SPRINT PARSER (NATURAL LANGUAGE)</span>
          </div>

          <div className="relative">
            <input 
              type="text"
              required
              disabled={parsingTask}
              placeholder="e.g. 'I have DSA tomorrow' or 'Finish billing gateways on Stripe by Friday'..."
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              className="w-full bg-[#050508]/90 border border-zinc-800 rounded-xl px-4 py-3 pr-12 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all font-sans leading-relaxed"
            />
            <button 
              type="submit"
              disabled={parsingTask || !quickPrompt.trim()}
              className="absolute right-2.5 top-2 p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white rounded-lg transition-colors cursor-pointer"
            >
              {parsingTask ? (
                <RotateCw size={13} className="animate-spin" />
              ) : (
                <ChevronRight size={13} />
              )}
            </button>
          </div>

          {/* Prompt quick suggestion templates */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[9px] text-zinc-500 uppercase">SUGGESTIONS:</span>
            <button
              type="button"
              onClick={() => setQuickPrompt('I have DSA tomorrow')}
              className="bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-zinc-200 text-left px-2.5 py-1 rounded-lg text-[10px] transition-all"
            >
              "I have DSA tomorrow"
            </button>
            <button
              type="button"
              onClick={() => setQuickPrompt('Finish Stripe signature keys security audit by Friday')}
              className="bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-zinc-200 text-left px-2.5 py-1 rounded-lg text-[10px] transition-all"
            >
              "Stripe signature audit"
            </button>
          </div>
        </form>
      </div>

      {/* AI COGNITIVE COCKPIT CONTROL PANEL */}
      <div className="bg-[#050508]/40 border border-zinc-900 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-3">
          <div className="space-y-0.5">
            <span className="font-mono text-[9px] text-purple-400 uppercase tracking-wider font-bold">COGNITIVE COCKPIT</span>
            <h3 className="font-sans font-bold text-xs text-zinc-200">Interactive AI Operational Suites</h3>
          </div>
          
          {/* Real-time Motivation Banner based on AI Personality */}
          <div className="flex items-center gap-2 bg-purple-500/5 border border-purple-500/10 px-3 py-1.5 rounded-xl max-w-md">
            <Sparkles size={11} className="text-purple-400 animate-pulse shrink-0" />
            <p className="font-sans text-[10px] text-purple-300 italic leading-snug">
              {aiPersonality === 'roast' ? (
                `"Quit procrastinating. Your backlog compliance score is down to ${productivityScore}%. Resolve your critical objectives before I roast you further."`
              ) : aiPersonality === 'friendly' ? (
                `"You are doing great! Let's handle the next task together. Select 'What Should I Do Next?' to begin."`
              ) : aiPersonality === 'motivational' ? (
                `"Forge your focus in deep lock chambers! Greatness is earned by resolving critical path objectives. Command the queue!"`
              ) : (
                `"Current system load indicates a backlog density of ${activeTasks.length} pending items. Select a cognitive tool to proceed."`
              )}
            </p>
          </div>
        </div>

        {/* Bento Grid Triggers */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { id: 'decision', title: 'AI Decision Engine', desc: 'What to do next', icon: Brain, color: 'hover:border-purple-500/40 text-purple-400 bg-purple-950/5' },
            { id: 'simulator', title: 'Crisis Simulator', desc: 'Snooze & Recompute', icon: Sliders, color: 'hover:border-blue-500/40 text-blue-400 bg-blue-950/5' },
            { id: 'diagnostics', title: 'Diagnostics', desc: 'Why am I behind?', icon: LineChart, color: 'hover:border-emerald-500/40 text-emerald-400 bg-emerald-950/5' },
            { id: 'burnout', title: 'Burnout Monitor', desc: 'Fatigue detector', icon: Heart, color: 'hover:border-red-500/40 text-red-400 bg-red-950/5' },
            { id: 'meeting', title: 'Smart Meeting', desc: 'Auto-reschedule', icon: Calendar, color: 'hover:border-amber-500/40 text-amber-400 bg-amber-950/5' },
            { id: 'scenarios', title: 'Compare Plans', desc: 'Balanced vs Risk', icon: Compass, color: 'hover:border-pink-500/40 text-pink-400 bg-pink-950/5' }
          ].map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={() => {
                  setSuiteTab(btn.id as any);
                  setIsSuiteOpen(true);
                }}
                className={`p-3.5 rounded-xl border border-zinc-900/85 hover:bg-black/60 text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer relative overflow-hidden group ${btn.color}`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-1 rounded-lg bg-black/40 border border-zinc-800/40">
                    <Icon size={14} />
                  </div>
                  <span className="text-[8px] font-mono text-zinc-650 opacity-0 group-hover:opacity-100 transition-opacity">LAUNCH</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold block text-zinc-200 truncate">{btn.title}</span>
                  <span className="text-[8px] text-zinc-550 font-mono block uppercase truncate">{btn.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DYNAMIC BACKLOG RESCUE NOTIFIER */}
      {rescuePlan ? (
        <div className="bg-amber-500/5 border border-amber-500/35 p-5 rounded-2xl space-y-4 shadow-lg shadow-amber-500/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/25">
                <ShieldAlert size={16} className="animate-pulse" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-xs text-amber-400 uppercase tracking-wider">Rescue protocol active</h3>
                <p className="font-sans text-[10px] text-zinc-400 mt-0.5">Non-critical drag elements removed. Execute focus tasks immediately.</p>
              </div>
            </div>
            <button 
              onClick={clearRescueMode}
              className="text-[10px] font-mono text-zinc-500 hover:text-amber-400 bg-zinc-950 border border-zinc-900 rounded-lg px-2.5 py-1 transition-colors self-start sm:self-auto cursor-pointer"
            >
              Restore Standard OS Settings
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rescue focus actions list */}
            <div className="space-y-3">
              <span className="font-mono text-[9px] text-zinc-500 block uppercase">RECOVERY ZONE TRIAGE</span>
              <div className="space-y-2">
                {rescuePlan.actions.map((act, index) => (
                  <div key={index} className="bg-zinc-950 border border-zinc-900/80 p-3 rounded-lg flex items-start justify-between gap-3 font-sans">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded ${
                          act.type === 'focus' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          act.type === 'move' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-zinc-900 text-zinc-500'
                        }`}>
                          {act.type}
                        </span>
                        <p className="font-semibold text-zinc-200 text-xs truncate leading-none">{act.task.title}</p>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-normal">{act.actionDescription}</p>
                    </div>

                    {act.type === 'focus' ? (
                      <button 
                        onClick={() => startFocusSession(act.task.id, 45)}
                        className="bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        <Play size={12} fill="currentColor" />
                      </button>
                    ) : act.type === 'move' ? (
                      <button 
                        onClick={() => handleCompleteTask(act.task)}
                        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        <Check size={12} />
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Recovery timeline chart */}
            <div className="bg-[#050508]/60 border border-zinc-900 p-4 rounded-xl space-y-3">
              <span className="font-mono text-[9px] text-zinc-500 block uppercase">RECOVERY RUN TIMELINE</span>
              <div className="space-y-2.5 font-sans text-[11px]">
                {rescuePlan.recoveryTimeline.map((tl, index) => (
                  <div key={index} className="flex gap-3">
                    <span className="font-mono text-amber-500 font-semibold shrink-0 text-[10px] mt-0.5">{tl.time}</span>
                    <span className="text-zinc-300">{tl.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* CORE STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Compliance Rating Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-zinc-500 uppercase">Productivity Compliance</span>
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          </div>

          <div className="flex items-center gap-4 py-2">
            {/* Circle progress bar */}
            <div className="relative w-16 h-16 shrink-0">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-zinc-900"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-500"
                  strokeDasharray={`${productivityScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-zinc-100 text-xs">
                {productivityScore}%
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-sans text-xs text-zinc-300 block font-semibold">
                {productivityScore > 80 ? 'Optimal Sprint Pace' : productivityScore > 60 ? 'Unstable Velocity' : 'Critical Backlog Block'}
              </span>
              <span className="font-sans text-[10px] text-zinc-400 block leading-normal">
                {productivityScore > 80 ? 'Maintain current deep lock chambers to hit release goals.' : 'Minimize context switching to prevent overdue growth.'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-zinc-900/60 pt-3">
            <div>
              <span className="font-mono text-[9px] text-zinc-500 block">COMPLETED</span>
              <span className="font-sans font-bold text-xs text-zinc-200 mt-0.5 block">{completedTasksCount} items</span>
            </div>
            <div>
              <span className="font-mono text-[9px] text-zinc-500 block">OVERDUE OVERHEAD</span>
              <span className="font-sans font-bold text-xs text-red-400 mt-0.5 block">{overdueCount} items</span>
            </div>
          </div>
        </div>

        {/* Heatmap density matrix */}
        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-zinc-500 uppercase">SPRINT MATRIX HISTOGRAM</span>
            <span className="font-mono text-[9px] text-emerald-400 uppercase">LIVE COMPLIANCE</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 py-1">
            {heatmapData.map((row, rIdx) => 
              row.map((val, cIdx) => (
                <div 
                  key={`${rIdx}-${cIdx}`} 
                  className={`w-full aspect-square rounded-sm ${getColorClassForHeatmap(val)}`}
                />
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t border-zinc-900/60 pt-3 text-[9px] font-mono text-zinc-500 uppercase">
            <span>Low Tempo</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded bg-zinc-950 border border-zinc-900" />
              <div className="w-1.5 h-1.5 rounded bg-blue-900/30" />
              <div className="w-1.5 h-1.5 rounded bg-blue-600/40" />
              <div className="w-1.5 h-1.5 rounded bg-blue-500" />
            </div>
            <span>Deep Lock</span>
          </div>
        </div>

        {/* Dynamic Rescue mode entry form */}
        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert size={15} className="text-amber-500" />
            <span className="font-mono text-[10px] text-zinc-500 uppercase">BACKLOG OVERRIDE GATE</span>
          </div>

          {!showRescueForm ? (
            <div className="space-y-4 py-2">
              <p className="font-sans text-xs text-zinc-400 leading-normal">
                If backlog overlaps or task fatigue is stalling your velocity, activate the <strong className="text-zinc-300">Emergency Rescue</strong> protocol.
              </p>
              <button 
                onClick={() => setShowRescueForm(true)}
                className="w-full bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap size={13} className="text-amber-400 animate-pulse" />
                <span>Initialize Emergency Triage</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleRescueSubmit} className="space-y-3">
              <div>
                <label className="block font-mono text-[9px] text-zinc-500 mb-1 uppercase">EXPLAIN DEVIATION STATE</label>
                <input 
                  type="text" 
                  required
                  placeholder='e.g., "I wasted my day with context switching"'
                  value={rescueInput}
                  onChange={(e) => setRescueInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/10"
                />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowRescueForm(false)}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 text-[10px] py-1.5 rounded border border-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-[10px] py-1.5 rounded font-semibold transition-colors"
                >
                  Verify Triage
                </button>
              </div>
            </form>
          )}

          <div className="border-t border-zinc-900/60 pt-3 flex items-center justify-between text-[9px] font-mono text-zinc-500">
            <span>SECURE BACKLOG OVERRIDE GATE</span>
          </div>
        </div>
      </div>

      {/* SPRINT CONSOLE QUEUE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Urgent/In-Progress Action items */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md p-6 rounded-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div>
              <h3 className="font-sans font-bold text-sm text-zinc-100">Sprint Backlog Queue</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">ADAPTIVE PRIORITY ROUTING STAGE</p>
            </div>
            
            <button 
              onClick={() => setCurrentPage('tasks')}
              className="font-sans text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>Manage Console</span>
              <ChevronRight size={12} />
            </button>
          </div>

          {/* CALENDAR STRIP WIDGET */}
          <div className="bg-[#050508]/60 border border-zinc-900/80 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-zinc-400 flex items-center gap-1.5 font-semibold">
                <Calendar size={11} className="text-blue-400" />
                <span>CHRONO-TIMELINE STRIP</span>
              </span>
              {selectedCalendarDate && (
                <button 
                  onClick={() => setSelectedCalendarDate(null)}
                  className="font-mono text-[9px] text-zinc-500 hover:text-zinc-300 uppercase underline"
                >
                  Clear Date Filter
                </button>
              )}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((date, idx) => {
                const formatted = date.toISOString().split('T')[0];
                const isSelected = selectedCalendarDate === formatted;
                const isToday = new Date().toISOString().split('T')[0] === formatted;
                const count = getTasksCountForDate(date);
                const dayName = date.toLocaleDateString([], { weekday: 'short' });
                const dayNum = date.getDate();

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedCalendarDate(isSelected ? null : formatted)}
                    className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all border text-center relative ${
                      isSelected 
                        ? 'bg-blue-600/15 border-blue-500 text-blue-300 shadow-md shadow-blue-500/5' 
                        : isToday 
                        ? 'bg-zinc-900/60 border-zinc-700/60 text-white font-bold' 
                        : 'bg-zinc-950/40 border-zinc-900/50 text-zinc-400 hover:border-zinc-800'
                    }`}
                  >
                    <span className="text-[9px] uppercase font-mono block tracking-wider">{dayName}</span>
                    <span className="text-xs font-semibold block">{dayNum}</span>
                    {count > 0 && (
                      <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${isSelected ? 'bg-blue-400' : 'bg-purple-500'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ENERGY SIZER WIDGET */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-zinc-400 flex items-center gap-1.5 font-semibold">
                <Activity size={11} className="text-emerald-400 animate-pulse" />
                <span>COGNITIVE ENERGY MATCHING ENGINE</span>
              </span>
              <span className="font-mono text-[9px] text-zinc-500 uppercase">ADAPT SCHEDULE</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'all', label: 'All Levels', desc: 'No constraints', color: 'bg-zinc-900 border-zinc-800 text-zinc-300' },
                { id: 'low', label: 'Low Energy', desc: 'Admin / light', color: 'bg-emerald-950/25 border-emerald-900/35 text-emerald-400' },
                { id: 'medium', label: 'Medium', desc: 'Steady focus', color: 'bg-blue-950/25 border-blue-900/35 text-blue-400' },
                { id: 'high', label: 'High Focus', desc: 'Master / algorithms', color: 'bg-red-950/25 border-red-900/35 text-red-400' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setEnergyFilter(btn.id as any)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    energyFilter === btn.id 
                      ? 'ring-2 ring-purple-500/50 border-purple-500 bg-purple-950/10'
                      : 'hover:bg-zinc-950/40 hover:border-zinc-800 bg-[#050508]/40 border-zinc-900/80'
                  }`}
                >
                  <span className="text-[10px] font-bold block">{btn.label}</span>
                  <span className="text-[8px] text-zinc-500 font-mono block truncate uppercase">{btn.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* TASKS LIST */}
          <div className="space-y-3">
            {dataSyncing && tasks.length === 0 ? (
              // SKELETON LOADER
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-[#050508]/80 border border-zinc-900 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-3 bg-zinc-800 rounded w-1/4"></div>
                      <div className="h-4 bg-zinc-800 rounded w-12"></div>
                    </div>
                    <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                  </div>
                  <div className="h-10 w-10 bg-zinc-800 rounded-xl shrink-0"></div>
                </div>
              ))
            ) : energyFilteredTasks.length === 0 ? (
              <div className="py-12 border border-dashed border-zinc-900/60 bg-[#050508]/50 text-center text-zinc-500 rounded-xl space-y-4 font-sans text-xs">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto border border-blue-500/20">
                  <CheckCircle2 size={24} className="text-blue-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-300 font-semibold text-sm">Your schedule is perfectly clear.</p>
                  <p className="text-[11px] text-zinc-500 max-w-[250px] mx-auto leading-relaxed">No active items match your current energy parameters. Use the AI Sprint Parser above to queue new objectives.</p>
                </div>
              </div>
            ) : (
              energyFilteredTasks.slice(0, 3).map((task) => (
                <div 
                  key={task.id} 
                  className="bg-[#050508]/80 border border-zinc-900 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-800 transition-colors"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border ${
                        task.priority === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        task.priority === 'high' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        task.priority === 'medium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="font-mono text-[9px] text-zinc-500 uppercase">{task.category}</span>
                      <span className="font-mono text-[9px] text-zinc-500">DUE: {task.deadline}</span>
                    </div>
                    <p className="font-sans font-bold text-xs text-zinc-200 truncate">{task.title}</p>
                    <p className="font-sans text-[11px] text-zinc-400 line-clamp-1 leading-normal">{task.description}</p>
                  </div>

                  <div className="flex items-center gap-2 md:self-center">
                    <button 
                      onClick={() => handleCompleteTask(task)}
                      className="bg-[#07070a] hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 p-2 rounded-xl transition-all text-xs cursor-pointer"
                    >
                      <Check size={14} />
                    </button>
                    <button 
                      onClick={() => startFocusSession(task.id, 25)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Timer size={14} />
                      <span>Lock Focus</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Action Suggestions Panel */}
        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-md p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-sans font-bold text-sm text-zinc-100">AI Tactical Directives</h3>
            <Sparkles size={14} className="text-blue-400 animate-pulse" />
          </div>

          <div className="space-y-3 text-xs leading-relaxed font-sans">
            {overdueCount > 0 ? (
              <div className="border border-zinc-900 bg-[#050508]/80 p-3 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                  <Cpu size={12} className="text-red-400" />
                  <span>Overdue Risk Mitigation</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  {overdueCount} task{overdueCount > 1 ? 's' : ''} {overdueCount > 1 ? 'are' : 'is'} overdue. Risk analysis forecasts context bottlenecking if delayed further.
                </p>
                <button 
                  onClick={() => startFocusSession(tasks.find(t => t.status === 'overdue')?.id, 30)}
                  className="text-[10px] text-red-400 hover:text-red-300 font-mono font-medium flex items-center gap-0.5"
                >
                  Execute 30m mitigation run <ChevronRight size={10} />
                </button>
              </div>
            ) : activeTasks.length > 0 ? (
              <div className="border border-zinc-900 bg-[#050508]/80 p-3 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                  <Cpu size={12} className="text-blue-400" />
                  <span>Suggested Focus Target</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  Your task "{activeTasks[0].title}" is primed for execution.
                </p>
                <button 
                  onClick={() => startFocusSession(activeTasks[0].id, 45)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-mono font-medium flex items-center gap-0.5"
                >
                  Initiate 45m deep focus <ChevronRight size={10} />
                </button>
              </div>
            ) : null}

            <div className="border border-zinc-900 bg-[#050508]/80 p-3 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span>Optimal Temporal Slots</span>
              </div>
              <p className="text-zinc-400 text-[11px]">
                Productivity heatmap tracks highest execution rate from 14:00 to 17:00 UTC. Prioritize deep work during this window.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Achievements column wrapper */}
        <div className="mt-6 lg:col-span-3">
          <AchievementsWidget />
        </div>
      </div>

      {/* AI OPERATIONS COCKPIT OVERLAY */}
      <AIOperationsSuite 
        isOpen={isSuiteOpen} 
        onClose={() => setIsSuiteOpen(false)} 
        defaultTab={suiteTab} 
      />
    </div>
  );
};
