import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AIExplainabilityCard } from '../components/AIExplainabilityCard';
import { 
  Sparkles, 
  Cpu, 
  ShieldAlert, 
  Calendar, 
  Hourglass, 
  Check, 
  ArrowRight, 
  AlertTriangle, 
  Terminal,
  Zap,
  RotateCw
} from 'lucide-react';

export const PlannerPage: React.FC = () => {
  const { generatePlan, plans, approvePlan, tasks, dataSyncing } = useApp();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await generatePlan(prompt);
      setPrompt('');
    } catch (err: any) {
      setError("The AI planning service is currently experiencing high load. Please try your request again shortly.");
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (text: string) => {
    setPrompt(text);
  };

  const activePlans = plans;

  const suggestChips = [
    'Deploy Stripe webhook handlers & web mock keys due Friday',
    'Review 5 Leetcode Dynamic Programming hard problems',
    'Figma visual asset styling guide for dark operating system'
  ];

  return (
    <div id="planner-viewport" className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto text-left font-sans">
      
      {/* HEADER SECTION */}
      <div className="space-y-1.5 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles size={16} />
          </div>
          <h2 className="text-3xl font-light tracking-tight text-white">AI Sprint Compiler</h2>
        </div>
        <p className="text-xs text-slate-400 leading-normal max-w-2xl">
          Convert raw, unorganized goals into mathematically optimized schedules, complete with granular checklists, risk metrics, and buffer hours.
        </p>
      </div>

      {/* INPUT CONTROLS SECTION */}
      <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-md p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <form onSubmit={handlePlannerSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block font-mono text-[9px] text-slate-500 mb-1.5 uppercase font-medium">UNSTRUCTURED TASK SPECIFICATION</label>
            <div className="relative">
              <textarea 
                rows={3}
                required
                disabled={loading}
                placeholder="e.g., 'I have an assignment tomorrow for DSA Graphs and need to complete production deployments of Stripe API keys before Friday...'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 pr-12 text-xs text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 placeholder-slate-500 transition-all font-sans leading-relaxed resize-none"
              />
              <button 
                type="submit"
                disabled={loading || !prompt.trim()}
                className="absolute right-3.5 bottom-3.5 p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white rounded-xl transition-colors cursor-pointer"
              >
                {loading ? (
                  <RotateCw size={14} className="animate-spin" />
                ) : (
                  <ArrowRight size={14} />
                )}
              </button>
            </div>
            
            {/* Loading Thinking Experience */}
            {loading && (
              <div className="absolute inset-0 bg-[#020204]/80 backdrop-blur-sm rounded-xl flex items-center justify-center p-4">
                <div className="flex items-center gap-3">
                  <RotateCw size={16} className="animate-spin text-purple-400" />
                  <span className="text-xs text-purple-300 font-mono animate-pulse">Calculating optimal execution strategy...</span>
                </div>
              </div>
            )}
          </div>

          {/* Prompt chips suggestions */}
          <div className="space-y-1.5">
            <span className="font-mono text-[9px] text-zinc-500 block uppercase font-medium">COMPILATION TEMPLATES</span>
            <div className="flex flex-col gap-1.5">
              {suggestChips.map((chip, idx) => (
                <button 
                  key={idx}
                  type="button"
                  disabled={loading}
                  onClick={() => handleChipClick(chip)}
                  className="bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200 text-left px-3 py-1.5 rounded-lg text-[11px] transition-all truncate"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* PLAN BLUEPRINTS DISPLAY LIST */}
      <div className="space-y-6">
        {error ? (
          <div className="py-12 border border-red-500/10 bg-[#050508]/80 rounded-2xl text-center space-y-4 font-sans backdrop-blur-sm">
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
              <ShieldAlert size={20} className="text-red-400" />
            </div>
            <div className="space-y-1.5">
              <p className="font-semibold text-zinc-200 text-sm">Compilation Interrupted</p>
              <p className="text-[11px] text-zinc-400 max-w-xs mx-auto leading-relaxed">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="mt-2 px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
            >
              Acknowledge & Clear
            </button>
          </div>
        ) : dataSyncing && activePlans.length === 0 ? (
          <div className="space-y-6 animate-pulse">
            <span className="font-mono text-[10px] text-zinc-500 block uppercase">SYNCHRONIZING BLUEPRINTS...</span>
            <div className="border border-zinc-900 rounded-2xl bg-white/[0.02] p-5 md:p-6 space-y-6">
              <div className="flex justify-between gap-3 border-b border-white/5 pb-4">
                 <div className="space-y-2 flex-1">
                   <div className="h-4 bg-zinc-800 rounded w-1/4"></div>
                   <div className="h-5 bg-zinc-800 rounded w-1/2"></div>
                 </div>
                 <div className="h-8 w-24 bg-zinc-800 rounded-xl"></div>
              </div>
              <div className="h-20 bg-[#050508] border border-zinc-900 rounded-xl"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-40 bg-zinc-950 border border-zinc-900 rounded-xl"></div>
                <div className="h-40 bg-zinc-950 border border-zinc-900 rounded-xl"></div>
              </div>
            </div>
          </div>
        ) : activePlans.length === 0 ? (
          <div className="py-16 border border-dashed border-zinc-900/60 bg-[#050508]/50 rounded-2xl text-center text-zinc-500 space-y-4">
            <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto border border-purple-500/20">
              <Cpu size={28} className="text-purple-400" />
            </div>
            <div className="space-y-1">
              <p className="font-sans font-semibold text-zinc-300 text-sm">No Active Blueprints</p>
              <p className="font-sans text-[11px] text-zinc-500 max-w-sm mx-auto leading-relaxed">Input unstructured criteria above. Our compliance network will parse risk values, synthesize timelines, and map out your critical path.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <span className="font-mono text-[10px] text-zinc-500 block uppercase">COMPILED COGNITIVE BLUEPRINTS ({activePlans.length})</span>
            
            {activePlans.map((plan) => (
              <div 
                key={plan.id}
                className={`border rounded-2xl bg-white/[0.03] backdrop-blur-md p-5 md:p-6 space-y-6 relative overflow-hidden transition-all duration-300 ${
                  plan.isApproved ? 'border-white/5 opacity-70' : 'border-purple-500/30'
                }`}
              >
                {/* Heading details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full border border-purple-500/25">
                        COMPREHENSIVE MAP
                      </span>
                      <span className="font-mono text-[9px] text-zinc-500">
                        COMPILED: {new Date(plan.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                      </span>
                    </div>
                    <h3 className="font-sans font-bold text-sm text-zinc-200 truncate italic">"{plan.prompt}"</h3>
                  </div>

                  {!plan.isApproved ? (
                    <button 
                      onClick={() => approvePlan(plan.id)}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-sans text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <Check size={14} />
                      <span>Approve & Inject Sprint</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-900 text-emerald-400 px-3 py-1.5 rounded-xl font-mono text-[10px] uppercase font-bold shrink-0">
                      <Check size={12} />
                      <span>INJECTED TO SPRINT</span>
                    </div>
                  )}
                </div>

                {/* Summary / Analysis statement */}
                <div className="bg-[#050508] border border-zinc-900 p-4 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-sans font-semibold text-zinc-200 text-xs">
                      <Terminal size={14} className="text-purple-400" />
                      <span>AI COMPLIANCE ANALYSIS SUMMARY</span>
                    </div>
                    <AIExplainabilityCard 
                      topic="Plan Generation" 
                      details={`Generated plan for prompt: "${plan.prompt}". Why was this particular sequence and subtask breakdown chosen?`} 
                    />
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    {plan.summary}
                  </p>
                </div>

                {/* Subtask mapping grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tasks List */}
                  <div className="space-y-3">
                    <span className="font-mono text-[9px] text-zinc-500 block uppercase">GENERATED TASK NODES</span>
                    <div className="space-y-2.5">
                      {plan.tasks.map((task, tIdx) => (
                        <div key={tIdx} className="bg-zinc-950/60 border border-zinc-900 p-3.5 rounded-xl space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-sans font-bold text-xs text-zinc-200">{task.title}</span>
                            <span className="font-mono text-[9px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/10">{task.estimatedHours}h</span>
                          </div>
                          
                          <p className="text-[11px] text-zinc-400 leading-normal">{task.description}</p>
                          
                          <div className="space-y-1.5">
                            {task.subtasks.map((sub, sIdx) => (
                              <div key={sIdx} className="flex items-center gap-2 font-sans text-[11px] text-zinc-400">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500/40" />
                                <span>{sub.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risks & Timeline */}
                  <div className="space-y-6">
                    {/* Risk Indicators */}
                    <div className="space-y-3">
                      <span className="font-mono text-[9px] text-zinc-500 block uppercase">CRITICAL PATH RISK ASSESSMENT</span>
                      <div className="border border-red-500/10 bg-red-500/5 p-4 rounded-xl space-y-3">
                        <div className="flex items-center gap-2 text-red-400 font-sans font-bold text-xs uppercase">
                          <AlertTriangle size={15} />
                          <span>{plan.riskAssessment.level} THREAT THRESHOLD DETECTED</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{plan.riskAssessment.description}</p>
                        
                        <div className="space-y-1">
                          <span className="font-mono text-[9px] text-zinc-500 uppercase block font-semibold">PREDICTED BOTTLENECKS:</span>
                          <ul className="list-disc pl-4 space-y-1 text-[11px] text-zinc-400 font-sans">
                            {plan.riskAssessment.bottlenecks.map((bot, bIdx) => (
                              <li key={bIdx}>{bot}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Phases */}
                    <div className="space-y-3">
                      <span className="font-mono text-[9px] text-zinc-500 block uppercase">OPTIMAL CHRONO-TIMELINE</span>
                      <div className="space-y-3 font-sans text-xs">
                        {plan.timeline.map((time, tmIdx) => (
                          <div key={tmIdx} className="flex gap-3">
                            <div className="flex flex-col items-center shrink-0">
                              <div className="w-2 h-2 rounded-full bg-purple-500" />
                              {tmIdx < plan.timeline.length - 1 && (
                                <div className="w-0.5 h-8 bg-zinc-900" />
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-zinc-200">{time.phaseName}</span>
                                <span className="font-mono text-[9px] text-zinc-500 bg-zinc-950 px-1 rounded border border-zinc-900">{time.duration}</span>
                              </div>
                              <p className="text-[11px] text-zinc-400">{time.tasks.join(', ')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
