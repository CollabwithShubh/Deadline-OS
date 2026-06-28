import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AIExplainabilityCard } from './AIExplainabilityCard';
import { Task } from '../types';
import { 
  Sparkles, 
  X, 
  Brain, 
  Sliders, 
  Check, 
  ChevronRight, 
  TrendingUp, 
  Cpu, 
  ShieldAlert, 
  Activity, 
  RotateCw, 
  Calendar, 
  Zap, 
  AlertTriangle, 
  Compass, 
  LineChart, 
  Heart,
  Timer,
  Play
} from 'lucide-react';

interface AIOperationsSuiteProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'decision' | 'simulator' | 'diagnostics' | 'burnout' | 'meeting' | 'scenarios';
}

export const AIOperationsSuite: React.FC<AIOperationsSuiteProps> = ({ isOpen, onClose, defaultTab = 'decision' }) => {
  const { 
    tasks, 
    apiFetch, 
    aiPersonality, 
    syncData, 
    startFocusSession, 
    sendDesktopNotification 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);

  // Decision Engine State
  const [decision, setDecision] = useState<any | null>(null);

  // Simulator State
  const [simulatorSituation, setSimulatorSituation] = useState('');
  const [simulatorResult, setSimulatorResult] = useState<any | null>(null);
  const [applyingSimulator, setApplyingSimulator] = useState(false);

  // Diagnostics State
  const [diagnostics, setDiagnostics] = useState<any | null>(null);

  // Burnout State
  const [burnout, setBurnout] = useState<any | null>(null);

  // Meeting Mode State
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    durationHours: 1,
    dateTime: '',
    type: 'meeting'
  });
  const [meetingResult, setMeetingResult] = useState<any | null>(null);
  const [schedulingMeeting, setSchedulingMeeting] = useState(false);

  // Scenario Comparison State
  const [scenarios, setScenarios] = useState<any | null>(null);
  const [applyingScenario, setApplyingScenario] = useState<string | null>(null);

  // Trigger default fetch when opening or changing tabs
  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'decision') fetchDecision();
      else if (activeTab === 'diagnostics') fetchDiagnostics();
      else if (activeTab === 'burnout') fetchBurnout();
      else if (activeTab === 'scenarios') fetchScenarios();
    }
  }, [isOpen, activeTab]);

  // 1. Fetch Decision Engine
  const fetchDecision = async () => {
    setLoading(true);
    setDecision(null);
    try {
      const res = await apiFetch(`/api/ai/decision-engine?personality=${aiPersonality}`);
      if (res.success) {
        setDecision(res);
      }
    } catch (e) {
      console.error('Error fetching decision:', e);
    } finally {
      setLoading(false);
    }
  };

  // 2. Run Deadline Simulator
  const runSimulator = async (situation: string) => {
    setLoading(true);
    setSimulatorResult(null);
    try {
      const res = await apiFetch('/api/ai/simulator', {
        method: 'POST',
        body: JSON.stringify({ situation, personality: aiPersonality })
      });
      if (res.success) {
        setSimulatorResult(res);
      }
    } catch (e) {
      console.error('Error running simulator:', e);
    } finally {
      setLoading(false);
    }
  };

  const applySimulatorPlan = async () => {
    if (!simulatorResult || !simulatorResult.updatedTasks) return;
    setApplyingSimulator(true);
    try {
      const res = await apiFetch('/api/ai/simulator/apply', {
        method: 'POST',
        body: JSON.stringify({ updatedTasks: simulatorResult.updatedTasks })
      });
      if (res.success) {
        sendDesktopNotification('Adaptive Plan Synced ⚙️', {
          body: 'Your workspace and task deadlines have been fully adapted.'
        });
        await syncData();
        onClose();
      }
    } catch (e) {
      console.error('Error applying simulator plan:', e);
    } finally {
      setApplyingSimulator(false);
    }
  };

  // 3. Fetch Productivity Diagnostics
  const fetchDiagnostics = async () => {
    setLoading(true);
    setDiagnostics(null);
    try {
      const res = await apiFetch(`/api/ai/diagnostics?personality=${aiPersonality}`);
      if (res.success) {
        setDiagnostics(res);
      }
    } catch (e) {
      console.error('Error fetching diagnostics:', e);
    } finally {
      setLoading(false);
    }
  };

  // 4. Fetch Burnout Report
  const fetchBurnout = async () => {
    setLoading(true);
    setBurnout(null);
    try {
      const res = await apiFetch(`/api/ai/burnout-detector?personality=${aiPersonality}`);
      if (res.success) {
        setBurnout(res);
      }
    } catch (e) {
      console.error('Error fetching burnout:', e);
    } finally {
      setLoading(false);
    }
  };

  // 5. Run Smart Meeting
  const runMeetingScheduler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingForm.title || !meetingForm.dateTime) return;
    setSchedulingMeeting(true);
    setMeetingResult(null);
    try {
      const res = await apiFetch('/api/ai/smart-meeting', {
        method: 'POST',
        body: JSON.stringify({
          ...meetingForm,
          personality: aiPersonality
        })
      });
      if (res.success) {
        setMeetingResult(res);
        await syncData();
        sendDesktopNotification('Focus Sessions Protected 📅', {
          body: `Slotted in "${meetingForm.title}". Surrounding tasks adjusted.`
        });
      }
    } catch (e) {
      console.error('Error rescheduling meeting:', e);
    } finally {
      setSchedulingMeeting(false);
    }
  };

  // 6. Fetch Scenarios
  const fetchScenarios = async () => {
    setLoading(true);
    setScenarios(null);
    try {
      const res = await apiFetch(`/api/ai/scenario-comparison?personality=${aiPersonality}`);
      if (res.success) {
        setScenarios(res);
      }
    } catch (e) {
      console.error('Error fetching scenarios:', e);
    } finally {
      setLoading(false);
    }
  };

  const applyStrategy = async (strategyName: string, updatedTasks: Task[]) => {
    setApplyingScenario(strategyName);
    try {
      const res = await apiFetch('/api/ai/simulator/apply', {
        method: 'POST',
        body: JSON.stringify({ updatedTasks: updatedTasks || tasks })
      });
      if (res.success) {
        sendDesktopNotification(`${strategyName} Strategy Engaged ⚙️`, {
          body: `Workspace successfully configured to ${strategyName.toLowerCase()} constraints.`
        });
        await syncData();
        onClose();
      }
    } catch (e) {
      console.error('Error applying strategy:', e);
    } finally {
      setApplyingScenario(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      {/* Container */}
      <div className="w-full max-w-5xl bg-[#09090d] border border-zinc-800/80 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col h-[90vh] max-h-[800px] text-zinc-100">
        
        {/* Header bar */}
        <div className="h-16 border-b border-zinc-900/80 px-6 flex items-center justify-between shrink-0 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/10 text-purple-400 border border-purple-500/20 rounded-xl">
              <Brain size={16} className="animate-pulse" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-sm tracking-tight uppercase">AI OS Intelligence Suite</h2>
              <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">DeadlineOS Neural Cognitive Array</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-zinc-950/60 hover:bg-zinc-900/60 text-zinc-500 hover:text-zinc-300 border border-zinc-900 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex overflow-x-auto border-b border-zinc-900 shrink-0 px-4 bg-zinc-950/30 scrollbar-none font-sans text-xs">
          {[
            { id: 'decision', label: 'AI Decision Engine', icon: Sparkles },
            { id: 'simulator', label: 'Deadline Simulator', icon: Sliders },
            { id: 'diagnostics', label: 'Productivity Diagnostics', icon: LineChart },
            { id: 'burnout', label: 'Burnout Detector', icon: Heart },
            { id: 'meeting', label: 'Smart Meeting Mode', icon: Calendar },
            { id: 'scenarios', label: 'Scenario Comparison', icon: Compass }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3.5 border-b-2 font-semibold transition-all cursor-pointer whitespace-nowrap leading-none ${
                  isActive 
                    ? 'border-purple-500 text-purple-400 bg-purple-500/5' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-purple-400' : 'text-zinc-600'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-black/20 to-[#040406]">
          {loading && (
            <div className="h-full flex flex-col items-center justify-center space-y-4 font-mono text-xs text-zinc-500">
              <RotateCw size={24} className="animate-spin text-purple-500" />
              <div className="space-y-1 text-center">
                <p className="font-semibold text-zinc-400">CONNECTING TO GEMINI REASONING PIPELINE...</p>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest animate-pulse">Running cognitive compliance compiler</p>
              </div>
            </div>
          )}

          {!loading && (
            <div className="h-full">
              {/* Tab 1: AI Decision Engine */}
              {activeTab === 'decision' && decision && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Priority & Confidence Box */}
                    <div className="md:col-span-2 bg-[#0c0c12] border border-purple-500/15 p-5 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-36 h-full bg-purple-500/5 blur-[35px] rounded-full pointer-events-none" />
                      <div className="flex justify-between items-start gap-4 z-10 relative">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] text-purple-400 uppercase tracking-wider font-bold">OPTIMAL TARGET SELECTION</span>
                            <AIExplainabilityCard 
                              topic="Task Decision" 
                              details={`Why was "${decision.task.title}" selected as the top priority? Considering ${decision.reasoningSelected}`} 
                            />
                          </div>
                          <h3 className="font-sans font-bold text-base text-white">{decision.task.title}</h3>
                          <p className="text-[11px] text-zinc-400">
                            Estimated Burden: <span className="text-zinc-300 font-bold">{decision.task.estimatedHours} hours</span> • Risk weight: <span className="text-red-400 uppercase font-mono">{decision.task.risk}</span>
                          </p>
                        </div>
                        {/* Radial/Gauge-style Confidence */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                            <span className="font-mono font-bold text-sm text-purple-400">{decision.confidence}%</span>
                          </div>
                          <span className="font-mono text-[8px] text-zinc-500 uppercase mt-1">AI CONFIDENCE</span>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-zinc-900 pt-4 space-y-1 z-10 relative">
                        <div className="flex items-center gap-1 font-mono text-[9px] text-emerald-400 font-semibold uppercase">
                          <Zap size={11} />
                          <span>SUGGESTED IMMEDIATE ACTION</span>
                        </div>
                        <p className="font-sans text-xs text-zinc-300 leading-relaxed font-semibold">
                          {decision.suggestedNextAction}
                        </p>
                      </div>
                    </div>

                    {/* Stats summary card */}
                    <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                          <span className="font-mono text-[9px] text-zinc-500 uppercase">Risk Reduced</span>
                          <span className="font-mono text-xs text-emerald-400 font-bold">-{decision.riskReducedScore}%</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                          <span className="font-mono text-[9px] text-zinc-500 uppercase">Est. Completion</span>
                          <span className="font-mono text-xs text-zinc-300 font-bold">{decision.estCompletionTime}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2">
                          <span className="font-mono text-[9px] text-zinc-500 uppercase">Expected Outcome</span>
                          <span className="font-sans text-[11px] text-zinc-400 text-right leading-snug">{decision.expectedOutcome}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          startFocusSession(decision.task.id, 25);
                          onClose();
                        }}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-sans font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-purple-600/10 flex items-center justify-center gap-2"
                      >
                        <Play size={11} fill="currentColor" />
                        <span>ENGAGE DEEP FOCUS SESSION</span>
                      </button>
                    </div>
                  </div>

                  {/* Reasoning panels */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#050508]/80 border border-zinc-900 p-5 rounded-2xl space-y-3">
                      <div className="flex items-center gap-1.5 font-mono text-[9px] text-purple-400 uppercase font-semibold">
                        <Cpu size={11} />
                        <span>COGNITIVE SELECTION MOTIVATION</span>
                      </div>
                      <p className="font-sans text-xs text-zinc-400 leading-relaxed">
                        {decision.reasoningSelected}
                      </p>
                    </div>

                    <div className="bg-[#050508]/80 border border-zinc-900 p-5 rounded-2xl space-y-3">
                      <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-500 uppercase font-semibold">
                        <AlertTriangle size={11} className="text-zinc-600" />
                        <span>CANDIDATE DISMISSAL ANALYSIS</span>
                      </div>
                      <p className="font-sans text-xs text-zinc-500 leading-relaxed">
                        {decision.reasoningRejected}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Deadline Simulator */}
              {activeTab === 'simulator' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Custom situation form */}
                  <div className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-2xl space-y-4">
                    <div className="space-y-1">
                      <span className="font-mono text-[9px] text-zinc-500 uppercase">Injected Situation Constraint</span>
                      <p className="font-sans text-xs text-zinc-400">Describe what has changed in your day. Gemini will compute adaptive scheduling models.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder="e.g., 'I lost today's evening focus window' or 'I have a surprise audit tomorrow'..."
                        value={simulatorSituation}
                        onChange={(e) => setSimulatorSituation(e.target.value)}
                        className="flex-1 bg-black/60 border border-zinc-850 rounded-xl px-4 py-2.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={() => runSimulator(simulatorSituation)}
                        disabled={!simulatorSituation.trim()}
                        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-sans font-bold text-xs px-5 py-2.5 rounded-xl transition-colors shrink-0 cursor-pointer"
                      >
                        RECOMPUTE TIMELINE
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[8px] text-zinc-550">PRESET SCENARIOS:</span>
                      {[
                        "I only have 2 hours left today",
                        "I lost this evening focus window",
                        "My client interview got postponed by 3 days",
                        "I have unexpected emergency meetings"
                      ].map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSimulatorSituation(preset);
                            runSimulator(preset);
                          }}
                          className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 text-[10px] text-zinc-400 hover:text-zinc-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                        >
                          "{preset}"
                        </button>
                      ))}
                    </div>
                  </div>

                  {simulatorResult && (
                    <div className="space-y-6 mt-4">
                      {/* Analysis Block */}
                      <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] text-zinc-500 uppercase">COGNITIVE STRATEGY UPDATE</span>
                          <AIExplainabilityCard 
                            topic="Timeline Rescheduling" 
                            details={`How did Gemini decide to rearrange tasks due to the situation: "${simulatorSituation}"? What tasks were deprioritized?`} 
                          />
                        </div>
                        <p className="font-sans text-xs text-zinc-300 leading-relaxed">
                          {simulatorResult.situationAnalysis}
                        </p>
                      </div>

                      {/* Timeline transition changes with transformation animations */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-[#050508]/80 border border-zinc-900 p-5 rounded-2xl space-y-4">
                          <div className="flex items-center gap-2">
                            <Activity size={12} className="text-purple-400" />
                            <span className="font-mono text-[9px] text-zinc-400 uppercase">ADAPTED SCHEDULE CHANGE FLOW</span>
                          </div>

                          <div className="space-y-3 font-sans">
                            {simulatorResult.timelineChanges && simulatorResult.timelineChanges.map((item: any, i: number) => (
                              <div key={i} className="flex items-center gap-4 text-xs bg-black/40 border border-zinc-900/60 p-3 rounded-xl hover:bg-black/80 transition-all">
                                <div className="flex-1 min-w-0">
                                  <span className="font-semibold text-zinc-300 block truncate">{item.taskTitle}</span>
                                  <span className="text-[10px] text-zinc-500 block leading-normal mt-0.5">Original: {item.from}</span>
                                </div>
                                <div className="text-zinc-600 shrink-0 font-mono text-[10px]">↓</div>
                                <div className="text-right min-w-0 flex-1">
                                  <span className="font-semibold text-purple-400 block truncate">{item.to}</span>
                                  <span className="text-[9px] font-mono text-purple-400/80 uppercase px-1.5 bg-purple-500/5 border border-purple-500/10 rounded mt-0.5 inline-block">{item.type}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Impact Summary Metrics */}
                        <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between space-y-5">
                          <div className="space-y-4 font-mono text-xs">
                            <span className="font-mono text-[9px] text-zinc-550 block uppercase">ADAPTATION INDEX</span>
                            
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                              <span className="text-zinc-500 text-[10px]">TIME RECOVERED</span>
                              <span className="text-emerald-400 font-bold">{simulatorResult.metrics.recoveredHours}h</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                              <span className="text-zinc-500 text-[10px]">RISK REDUCTION</span>
                              <span className="text-emerald-400 font-bold">-{simulatorResult.metrics.riskReductionPercentage}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-zinc-500 text-[10px]">STABILITY DEVIATION</span>
                              <span className="text-purple-400 font-bold">{simulatorResult.metrics.confidenceScore}/100</span>
                            </div>
                          </div>

                          <button
                            onClick={applySimulatorPlan}
                            disabled={applyingSimulator}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-sans font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            {applyingSimulator ? (
                              <RotateCw size={13} className="animate-spin" />
                            ) : (
                              <Check size={13} />
                            )}
                            <span>ENGAGE NEW TIMELINE</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Productivity Diagnostics */}
              {activeTab === 'diagnostics' && diagnostics && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Diagnostic report card */}
                  <div className="bg-[#0c0c12] border border-purple-500/15 p-5 rounded-2xl space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-36 h-full bg-purple-500/5 blur-[35px] rounded-full pointer-events-none" />
                    <span className="font-mono text-[9px] text-purple-400 uppercase font-bold tracking-wider">BEHAVIORAL PRODUCTIVITY AUDIT</span>
                    <p className="font-sans text-xs text-zinc-300 leading-relaxed">
                      {diagnostics.behaviorReport}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* execution metrics */}
                    <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl space-y-4">
                      <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">Temporal Activity Focus</span>
                      <p className="font-sans text-xs text-zinc-400 leading-normal">
                        {diagnostics.executionTimeline}
                      </p>

                      <div className="space-y-2 border-t border-zinc-900 pt-3">
                        <span className="font-mono text-[9px] text-zinc-550 block uppercase">CORE COGNITIVE DRAIN LIST</span>
                        {diagnostics.expensiveHabits.map((habit: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-zinc-400">
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0" />
                            <span>{habit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Roadmap prescriptions */}
                    <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl space-y-4">
                      <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">Performance Recovery Roadmap</span>
                      <div className="space-y-3">
                        {diagnostics.improvementRoadmap.map((item: any, i: number) => (
                          <div key={i} className="flex gap-3 text-xs leading-normal">
                            <div className="w-5 h-5 bg-purple-500/10 text-purple-400 font-mono font-bold text-[10px] rounded flex items-center justify-center border border-purple-500/20 shrink-0">
                              {item.step}
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="font-bold text-zinc-200">{item.title}</h4>
                              <p className="text-zinc-400 text-[11px]">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Burnout Detector */}
              {activeTab === 'burnout' && burnout && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Burnout Indicator Gauge */}
                    <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
                      <span className="font-mono text-[9px] text-zinc-500 uppercase">COGNITIVE BUFFER LEVEL</span>
                      
                      {/* Gauge Indicator */}
                      <div className="relative w-28 h-28 flex items-center justify-center rounded-full bg-black/40 border border-zinc-900">
                        {/* Dynamic border lighting based on risk */}
                        <div className={`absolute inset-0 rounded-full border-4 ${
                          burnout.risk === 'critical' ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse' :
                          burnout.risk === 'warning' ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' :
                          'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                        }`} />
                        <div className="flex flex-col items-center">
                          <span className="font-mono text-lg font-bold text-white">{burnout.capacityPercentage}%</span>
                          <span className="font-mono text-[8px] text-zinc-550 uppercase">TOTAL DENSITY</span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className={`font-mono text-[10px] font-bold uppercase ${
                          burnout.risk === 'critical' ? 'text-red-400' :
                          burnout.risk === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {burnout.risk.toUpperCase()} BURN RISK
                        </span>
                        <p className="text-[10px] text-zinc-500">Threshold maximum: 100%</p>
                      </div>
                    </div>

                    {/* Stress Assessment Text */}
                    <div className="md:col-span-2 bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] text-zinc-500 uppercase">NEURAL COGNITIVE DECOMPOSITION</span>
                          <AIExplainabilityCard 
                            topic="Burnout Prediction" 
                            details="Explain why Gemini flagged this level of burnout based on workload density, focus intervals, and recovery gaps." 
                          />
                        </div>
                        <p className="font-sans text-xs text-zinc-300 leading-relaxed">
                          {burnout.assessment}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-zinc-900/60 space-y-1">
                        <span className="font-mono text-[9px] text-emerald-400 uppercase font-bold tracking-wider">RECOVERY PRESCRIPTION</span>
                        <p className="font-sans text-xs text-zinc-400 leading-normal">
                          {burnout.recoveryAdvice}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations panel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#050508]/80 border border-zinc-900 p-5 rounded-2xl space-y-3">
                      <span className="font-mono text-[9px] text-red-400 uppercase tracking-wider block">Rebalanced Tasks to Snooze/Postpone</span>
                      <ul className="space-y-2 font-sans text-xs text-zinc-400 pl-1">
                        {burnout.postponeRecommendations.map((rec: string, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-red-400/60 rounded-full shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#050508]/80 border border-zinc-900 p-5 rounded-2xl space-y-3">
                      <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-wider block">Operational Optimization Suggestions</span>
                      <ul className="space-y-2 font-sans text-xs text-zinc-500 pl-1">
                        {burnout.delegateRecommendations.map((rec: string, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Smart Meeting Mode */}
              {activeTab === 'meeting' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Setup Form */}
                    <form onSubmit={runMeetingScheduler} className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-2xl space-y-4">
                      <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">Inject Fixed Constraint</span>
                      
                      <div className="space-y-3 text-xs font-sans">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase">Event Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g., 'DSA Exam' or 'Hiring Interview'..."
                            value={meetingForm.title}
                            onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                            className="w-full bg-black/60 border border-zinc-850 rounded-xl px-3.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-500 uppercase">Duration (Hours)</label>
                            <input
                              type="number"
                              required
                              min={0.5}
                              max={10}
                              step={0.5}
                              value={meetingForm.durationHours}
                              onChange={(e) => setMeetingForm({ ...meetingForm, durationHours: parseFloat(e.target.value) })}
                              className="w-full bg-black/60 border border-zinc-850 rounded-xl px-3.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-zinc-500 uppercase">Type</label>
                            <select
                              value={meetingForm.type}
                              onChange={(e) => setMeetingForm({ ...meetingForm, type: e.target.value })}
                              className="w-full bg-black/60 border border-zinc-850 rounded-xl px-3.5 py-2 text-xs text-zinc-400 focus:outline-none focus:border-purple-500"
                            >
                              <option value="meeting">Meeting</option>
                              <option value="class">Class</option>
                              <option value="interview">Interview</option>
                              <option value="appointment">Appointment</option>
                              <option value="travel">Travel</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-zinc-500 uppercase">Scheduled Time</label>
                          <input
                            type="datetime-local"
                            required
                            value={meetingForm.dateTime}
                            onChange={(e) => setMeetingForm({ ...meetingForm, dateTime: e.target.value })}
                            className="w-full bg-black/60 border border-zinc-850 rounded-xl px-3.5 py-2 text-xs text-zinc-300 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={schedulingMeeting || !meetingForm.title || !meetingForm.dateTime}
                        className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-sans font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
                      >
                        {schedulingMeeting ? (
                          <RotateCw size={13} className="animate-spin text-white" />
                        ) : (
                          <Calendar size={13} />
                        )}
                        <span>SLOT EVENT & SHIFT</span>
                      </button>
                    </form>

                    {/* Rescheduling results panel */}
                    <div className="md:col-span-2 bg-[#050508]/80 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between">
                      {meetingResult ? (
                        <div className="space-y-4 animate-fadeIn flex-1">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[9px] text-purple-400 uppercase tracking-wider font-bold">AUTOMATED TIMELINE COMPILER</span>
                              <AIExplainabilityCard 
                                topic="Smart Rescheduling" 
                                details={`How did Gemini reschedule work to accommodate the new event? Why were these specific tasks chosen to shift?`} 
                              />
                            </div>
                            <p className="font-sans text-xs text-zinc-300 leading-relaxed">
                              {meetingResult.analysis}
                            </p>
                          </div>

                          <div className="space-y-2 border-t border-zinc-900 pt-3 flex-1 overflow-y-auto max-h-[160px] scrollbar-none font-sans text-xs">
                            <span className="font-mono text-[9px] text-zinc-500 block uppercase">CALENDAR RESOLUTION REPORT</span>
                            {meetingResult.adjustments.map((adj: any, i: number) => (
                              <div key={i} className="flex items-start justify-between gap-3 text-xs border border-zinc-950 p-2.5 rounded-xl bg-black/20">
                                <span className="font-bold text-zinc-300">{adj.taskTitle}</span>
                                <span className="text-[10px] text-purple-400 text-right font-medium">{adj.change}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center border-t border-zinc-900 pt-3">
                            <span className="font-mono text-[9px] text-zinc-550 uppercase">NEW INTEGRATED RISK LEVEL:</span>
                            <span className="font-mono text-xs text-emerald-400 font-bold uppercase">{meetingResult.newRiskLevel}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-zinc-500 font-mono text-[10px]">
                          <Calendar size={24} className="text-zinc-700 animate-pulse" />
                          <span>AWAITING CALENDAR EVENT INJECTION DATA...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 6: AI Scenario Comparison */}
              {activeTab === 'scenarios' && scenarios && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {scenarios.scenarios.map((scen: any, i: number) => (
                      <div 
                        key={i} 
                        className={`border rounded-2xl p-5 flex flex-col justify-between space-y-4 relative overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
                          scen.name === 'Balanced' ? 'bg-[#0a0a0f] border-purple-500/25 shadow-lg shadow-purple-500/5' :
                          scen.name === 'Aggressive' ? 'bg-red-500/5 border-red-500/10' :
                          'bg-emerald-500/5 border-emerald-500/10'
                        }`}
                      >
                        <div className="space-y-3 font-sans">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-bold text-sm tracking-tight ${
                                scen.name === 'Balanced' ? 'text-purple-400' :
                                scen.name === 'Aggressive' ? 'text-red-400' : 'text-emerald-400'
                              }`}>{scen.name} Strategy</h3>
                              <AIExplainabilityCard 
                                topic={`${scen.name} Strategy`} 
                                details={`Why did Gemini generate the ${scen.name} Strategy? What are the inherent risks and trade-offs of this approach versus the alternatives?`} 
                              />
                            </div>
                            <span className="font-mono text-[9px] text-zinc-500 uppercase">{scen.estimatedStress} STRESS</span>
                          </div>

                          <p className="text-[11px] text-zinc-400 leading-normal leading-relaxed italic">
                            "{scen.tagline}"
                          </p>

                          {/* Metric stats list */}
                          <div className="space-y-2 border-t border-zinc-900/60 pt-3 font-mono text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-zinc-500">SUCCESS PROBABILITY</span>
                              <span className="font-bold text-zinc-300">{scen.completionProbability}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">FREE BUFFER BUFFER</span>
                              <span className="font-bold text-zinc-300">{scen.freeTimeRemaining}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-zinc-500">AI COGNITIVE STABLE</span>
                              <span className="font-bold text-zinc-300">{scen.confidenceScore}/100</span>
                            </div>
                          </div>

                          {/* mini timeline list */}
                          <div className="space-y-1.5 border-t border-zinc-900/60 pt-3 text-[10px] text-zinc-400">
                            <span className="font-mono text-[8px] text-zinc-550 block uppercase">TIMELINE SYNOPSIS</span>
                            {scen.timelineSummary.map((slot: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                                <span className="truncate">{slot}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={() => applyStrategy(scen.name, scenarios.updatedTasks || tasks)}
                          disabled={applyingScenario !== null}
                          className={`w-full font-sans font-bold text-xs py-2 px-4 rounded-xl transition-colors cursor-pointer text-center block ${
                            scen.name === 'Balanced' ? 'bg-purple-600 hover:bg-purple-500 text-white' :
                            scen.name === 'Aggressive' ? 'bg-red-600 hover:bg-red-500 text-white' :
                            'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {applyingScenario === scen.name ? (
                            <RotateCw size={12} className="animate-spin mx-auto text-white" />
                          ) : (
                            `Deploy ${scen.name} Plan`
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
