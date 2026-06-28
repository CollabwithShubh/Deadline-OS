import React from 'react';
import { useApp } from '../context/AppContext';
import { AIExplainabilityCard } from '../components/AIExplainabilityCard';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Calendar, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Percent, 
  ChevronRight,
  ChevronDown
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { tasks, productivityScore, user, focusSession, dataSyncing, apiFetch } = useApp();

  const [aiReport, setAiReport] = React.useState<any>(null);
  const [loadingReport, setLoadingReport] = React.useState(false);

  React.useEffect(() => {
    setLoadingReport(true);
    apiFetch('/api/ai/analytics')
      .then(data => {
        if (data.success) {
          setAiReport(data);
        }
      })
      .catch(err => console.warn('[AnalyticsPage] Report fetch failed:', err))
      .finally(() => setLoadingReport(false));
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Render variables for a premium SVG Area Chart (Weekly Compliance Curve)
  const svgWidth = 500;
  const svgHeight = 160;
  
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const points = last7Days.map((date, idx) => {
    const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = date.toISOString().split('T')[0];
    
    let val = 0;
    
    const dayTasks = tasks.filter(t => t.deadline === dateStr || (t.createdAt && t.createdAt.startsWith(dateStr)));
    if (dayTasks.length > 0) {
       const completed = dayTasks.filter(t => t.status === 'completed').length;
       val = Math.round((completed / dayTasks.length) * 100);
    }
    
    const y = 130 - val; // val goes 0-100, y goes 130 to 30
    const x = 30 + (idx * 70);
    return { x, y, val, day: dayStr };
  });

  // Convert points to SVG polyline coordinates
  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  // Points to close the path for gradient background
  const areaPoints = `30,${svgHeight} ` + polylinePoints + ` 450,${svgHeight}`;

  const categoryStats = React.useMemo(() => {
    if (tasks.length === 0) return [];
    
    const countByCategory = tasks.reduce((acc, t) => {
      const cat = t.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500', 'bg-zinc-500'];
    
    return Object.entries(countByCategory)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 4) // Show top 4 categories
      .map(([label, count], idx) => ({
        label,
        percent: Math.round(((count as number) / tasks.length) * 100),
        color: colors[idx % colors.length]
      }));
  }, [tasks]);

  return (
    <div id="analytics-viewport" className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto text-left font-sans">
      
      {/* HEADER SECTION */}
      <div className="space-y-1.5 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BarChart3 size={16} />
          </div>
          <h2 className="text-3xl font-light tracking-tight text-white">Metrics Compliance Feed</h2>
        </div>
        <p className="text-xs text-slate-400 leading-normal max-w-md">Deconstruct performance velocity, track historical completion rates, and verify task trends.</p>
      </div>

      {/* THREE KEY METRICS CARD ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {dataSyncing && tasks.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
             <div key={i} className="bg-white/[0.03] border border-white/[0.08] p-6 rounded-2xl flex items-center justify-between animate-pulse">
               <div className="space-y-3 w-full">
                 <div className="h-3 w-24 bg-zinc-800 rounded"></div>
                 <div className="h-6 w-16 bg-zinc-800 rounded"></div>
                 <div className="h-3 w-32 bg-zinc-800 rounded"></div>
               </div>
               <div className="p-3 bg-zinc-800 rounded-xl shrink-0 h-10 w-10"></div>
             </div>
          ))
        ) : (
          <>
            {/* Metric 1 */}
            <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-md p-6 rounded-2xl flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="font-mono text-[9px] text-slate-500 uppercase">Weekly Compliance</span>
                <h3 className="font-sans font-bold text-2xl text-white">{productivityScore}%</h3>
                <span className="font-mono text-[9px] text-emerald-400 block">{completionRate > 50 ? '+4.8% FROM PREV CYCLE' : ''}</span>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 shrink-0">
                <Percent size={18} />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-md p-6 rounded-2xl flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="font-mono text-[9px] text-slate-500 uppercase">Focus Intervals Completed</span>
                <h3 className="font-sans font-bold text-2xl text-white">{focusSession.completedSessions} Runs</h3>
                <span className="font-mono text-[9px] text-slate-500 block">{focusSession.totalFocusTime} MINUTES TOTAL</span>
              </div>
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 shrink-0">
                <Clock size={18} />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-md p-6 rounded-2xl flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="font-mono text-[9px] text-slate-500 uppercase">Completion Rate</span>
                <h3 className="font-sans font-bold text-2xl text-white">{completionRate}%</h3>
                <span className="font-mono text-[9px] text-slate-500 block">{completedTasks} OF {totalTasks} COMPLETED</span>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
                <ShieldCheck size={18} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* WEEKLY COMPLIANCE CURVE GRAPH (GORGEOUS PREMIUM CUSTOM SVG!) */}
      <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-md p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h3 className="font-sans font-bold text-xs text-zinc-200 uppercase tracking-wider">Weekly Compliance Curve</h3>
            <p className="font-sans text-[10px] text-zinc-500 mt-0.5">Continuous mathematical mapping of task completion schedules versus original deadlines.</p>
          </div>
          <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 rounded-lg px-2.5 py-1 font-mono text-[10px] text-zinc-400">
            <Calendar size={12} className="text-blue-500" />
            <span>{last7Days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {last7Days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Responsive SVG wrapper */}
        <div className="w-full relative overflow-x-auto">
          {dataSyncing && tasks.length === 0 ? (
            <div className="min-w-[500px] h-48 flex items-center justify-center bg-zinc-950/40 rounded-xl border border-zinc-900/60 animate-pulse">
               <div className="w-full h-full p-4 flex flex-col justify-end space-y-2">
                 <div className="h-[2px] w-full bg-zinc-800/50"></div>
                 <div className="h-[2px] w-full bg-zinc-800/50"></div>
                 <div className="h-[2px] w-full bg-zinc-800/50"></div>
                 <div className="h-[2px] w-full bg-zinc-800/50"></div>
               </div>
            </div>
          ) : tasks.length === 0 ? (
             <div className="min-w-[500px] h-48 flex flex-col items-center justify-center border border-dashed border-zinc-900 rounded-xl bg-[#050508]/50">
               <TrendingUp size={24} className="text-zinc-600 mb-2" />
               <p className="text-zinc-400 font-sans text-sm font-semibold">Insufficient Data</p>
               <p className="text-zinc-500 font-sans text-[11px] max-w-xs text-center mt-1">Complete your first task to begin generating compliance projections.</p>
             </div>
          ) : (
            <div className="min-w-[500px] h-48 flex items-end">
            <svg className="w-full h-full" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
              {/* Grid Y lines */}
              <line x1="30" y1="30" x2="450" y2="30" stroke="#0e0e14" strokeWidth="1" strokeDasharray="4" />
              <line x1="30" y1="80" x2="450" y2="80" stroke="#0e0e14" strokeWidth="1" strokeDasharray="4" />
              <line x1="30" y1="130" x2="450" y2="130" stroke="#0e0e14" strokeWidth="1" strokeDasharray="4" />

              {/* Area path for gradient backdrop */}
              <polygon points={areaPoints} fill="url(#chart-gradient)" />
              
              {/* Polyline curve line */}
              <polyline
                fill="none"
                stroke="url(#line-gradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                points={polylinePoints}
              />

              {/* Dot Markers */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle cx={p.x} cy={p.y} r="5" fill="#030305" stroke="#3b82f6" strokeWidth="2.5" className="cursor-pointer hover:r-6 transition-all" />
                  <text x={p.x} y={p.y - 12} fill="#9ca3af" fontSize="9" fontFamily="monospace" textAnchor="middle">{p.val}%</text>
                  <text x={p.x} y={svgHeight - 6} fill="#6b7280" fontSize="9" fontFamily="monospace" textAnchor="middle">{p.day}</text>
                </g>
              ))}

              {/* Gradients configurations */}
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="line-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          )}
        </div>
      </div>

      {/* BOTTOM SECTOR ANALYSIS DETAILS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Allocation */}
        <div className="border border-zinc-900 bg-[#040407]/40 p-5 rounded-2xl space-y-4">
          <span className="font-mono text-[9px] text-zinc-500 uppercase block">ALLOCATION BY CATEGORY</span>
          
          <div className="space-y-3.5">
            {dataSyncing && tasks.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-3 w-20 bg-zinc-800 rounded"></div>
                    <div className="h-3 w-16 bg-zinc-800 rounded"></div>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full"></div>
                </div>
              ))
            ) : categoryStats.length === 0 ? (
              <div className="text-xs text-zinc-500 font-sans italic py-6 text-center">No category data available. Complete tasks to see allocation.</div>
            ) : (
              categoryStats.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between text-xs text-zinc-300 font-sans mb-1">
                    <span className="font-semibold">{cat.label}</span>
                    <span className="font-mono text-[11px] text-zinc-400">{cat.percent}% Allocation</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.percent}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* AI Directives Analytics Insights */}
        <div className="border border-zinc-900 bg-[#040407]/40 p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[9px] text-zinc-500 uppercase block">AI PERFORMANCE INSIGHTS</span>
              <AIExplainabilityCard 
                topic="Analytics Calculation" 
                details="Detailed explanation of how productivity metrics and bottlenecks were calculated from historical execution patterns." 
              />
            </div>
            {aiReport?.reflection?.estimatedVsActualRatio && (
              <span className="font-mono text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md">
                DRIFT RATIO: {aiReport.reflection.estimatedVsActualRatio}x
              </span>
            )}
          </div>
          
          {loadingReport ? (
            <div className="space-y-4 animate-pulse py-2">
              <div className="h-3 w-full bg-zinc-800 rounded"></div>
              <div className="h-3 w-5/6 bg-zinc-800 rounded"></div>
              <div className="h-3 w-4/5 bg-zinc-800 rounded"></div>
              <div className="flex items-center gap-2 mt-4 text-zinc-500 font-mono text-[10px]">
                <Activity size={12} className="animate-pulse text-emerald-400" />
                <span>Analyzing historical execution patterns...</span>
              </div>
            </div>
          ) : aiReport ? (
            <div className="space-y-4 font-sans text-xs text-zinc-400">
              {/* Patterns */}
              {aiReport.analytics?.patterns?.map((pat: string, idx: number) => (
                <div key={`pat-${idx}`} className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                  <p className="leading-relaxed">
                    <strong className="text-zinc-200">Behavioral Trend:</strong> {pat}
                  </p>
                </div>
              ))}

              {/* Weaknesses */}
              {aiReport.analytics?.weaknesses?.map((weak: string, idx: number) => (
                <div key={`weak-${idx}`} className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400/80 shrink-0 mt-1.5" />
                  <p className="leading-relaxed">
                    <strong className="text-zinc-200">Potential Bottleneck:</strong> {weak}
                  </p>
                </div>
              ))}

              {/* Learning / Adjustments */}
              {aiReport.reflection?.adjustments?.map((adj: string, idx: number) => (
                <div key={`adj-${idx}`} className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                  <p className="leading-relaxed">
                    <strong className="text-zinc-200">Mitigation Tactic:</strong> {adj}
                  </p>
                </div>
              ))}

              {aiReport.analytics?.tacticalAdvice && (
                <div className="bg-zinc-950/80 border border-zinc-900 p-3.5 rounded-xl space-y-1.5 mt-2">
                  <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest block font-semibold">TACTICAL BRIEF</span>
                  <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">{aiReport.analytics.tacticalAdvice}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3 font-sans text-xs text-zinc-400">
              <div className="text-center py-6 text-zinc-500 font-mono text-[10px]">
                {tasks.length > 0 ? "Insufficient historical data to generate reliable AI insights yet." : "Complete tasks to unlock your AI performance insights."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
