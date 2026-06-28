import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Minimize2, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Zap, 
  Check, 
  BookOpen, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { audioEngine } from '../lib/audioSynth';

export const ExecutionPage: React.FC = () => {
  const { 
    focusSession, 
    tasks, 
    updateTask, 
    pauseFocusSession, 
    resumeFocusSession,
    resetFocusSession,
    stopFocusSession, 
    startFocusSession,
    fullscreenFocus, 
    setFullscreenFocus,
    setFocusSoundType,
    apiFetch
  } = useApp();

  const activeTask = tasks.find(t => t.id === focusSession.taskId);

  const [directives, setDirectives] = React.useState<any>(null);
  const [loadingDirectives, setLoadingDirectives] = React.useState(false);
  const [thinkingMsg, setThinkingMsg] = React.useState(0);
  const msgs = ['Understanding your current workload...', 'Calculating execution strategy...', 'Synthesizing physical next actions...', 'Optimizing your schedule...'];

  React.useEffect(() => {
    let int: any;
    if (loadingDirectives) {
      int = setInterval(() => {
        setThinkingMsg(prev => (prev + 1) % msgs.length);
      }, 2000);
    } else {
      setThinkingMsg(0);
    }
    return () => clearInterval(int);
  }, [loadingDirectives]);

  React.useEffect(() => {
    audioEngine.setSound(focusSession.soundType, focusSession.isActive && !focusSession.isPaused);
    return () => {
      audioEngine.setSound('none', false);
    };
  }, [focusSession.soundType, focusSession.isActive, focusSession.isPaused]);

  React.useEffect(() => {
    if (focusSession.isActive && focusSession.taskId) {
      setLoadingDirectives(true);
      apiFetch('/api/ai/execution', {
        method: 'POST',
        body: JSON.stringify({ taskId: focusSession.taskId })
      })
        .then(data => {
          if (data.success && data.directives) {
            setDirectives(data.directives);
          }
        })
        .catch(err => console.error('[ExecutionPage] Directives fetch failed:', err))
        .finally(() => setLoadingDirectives(false));
    } else {
      setDirectives(null);
    }
  }, [focusSession.isActive, focusSession.taskId]);

  // Format seconds to MM:SS
  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const soundOptions: { type: typeof focusSession.soundType; label: string; desc: string }[] = [
    { type: 'none', label: 'Silenced Space', desc: 'No background audio wave outputs.' },
    { type: 'cyberpunk', label: 'Cybernetic Loom', desc: 'Futuristic ambient synthesizer waves.' },
    { type: 'rain', label: 'Binaural Rain', desc: 'Gentle simulated rainfall frequency.' },
    { type: 'white_noise', label: 'Analog Noise', desc: 'Consistent background audio masking.' }
  ];

  const handleTimerComplete = () => {
    stopFocusSession(true); // Completed session successfully
  };

  const handleResetTimer = () => {
    resetFocusSession();
  };

  const handleCompleteCurrentTask = () => {
    if (activeTask) {
      updateTask({
        ...activeTask,
        status: 'completed'
      });
      stopFocusSession(true);
    }
  };

  const getAiRecommendedSound = () => {
    if (!activeTask) return { type: 'none', reason: 'No active task linked. Silent frequency recommended.' };
    const hour = new Date().getHours();
    
    if (activeTask.priority === 'critical' || activeTask.priority === 'high') {
      return { 
        type: 'cyberpunk', 
        reason: `Critical urgency detected on "${activeTask.title}". Fast-tempo synthetic loops recommended to stimulate mental focus velocity.` 
      };
    }
    if (hour >= 20 || hour < 6) {
      return { 
        type: 'white_noise', 
        reason: 'Late-night fatigue context detected. Steady analog masking waves recommended to insulate cognitive capacity.' 
      };
    }
    return { 
      type: 'rain', 
      reason: 'Regular focus workflow. Binaural rain acoustics recommended for sustained calm and alpha-wave generation.' 
    };
  };

  const recommendation = getAiRecommendedSound();

  return (
    <div 
      id="execution-viewport" 
      className={`min-h-[80vh] flex flex-col justify-between p-4 md:p-8 text-center font-sans ${
        fullscreenFocus ? 'bg-[#050505] h-screen w-full flex flex-col justify-center items-center py-16' : 'max-w-4xl mx-auto'
      }`}
    >
      {/* FULLSCREEN MINIMALIST HEAD ACTION */}
      {fullscreenFocus && (
        <button 
          onClick={() => setFullscreenFocus(false)}
          className="absolute top-6 right-6 p-2 bg-zinc-950 border border-zinc-900 rounded-full text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          title="Exit Fullscreen Lock"
        >
          <Minimize2 size={16} />
        </button>
      )}

      {/* TOP INSTRUCTION BANNER (Hide in minimalist fullscreen unless hover) */}
      {!fullscreenFocus && (
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 text-left w-full">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Timer size={16} />
              </div>
              <h2 className="text-3xl font-light tracking-tight text-white">Lock Focus Chambers</h2>
            </div>
            <p className="text-xs text-slate-400 leading-normal max-w-md">Eliminate secondary context switching. Immerse yourself inside a timed tactical workflow.</p>
          </div>

          <button 
            onClick={() => setFullscreenFocus(true)}
            className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white rounded-xl transition-all flex items-center gap-2 cursor-pointer text-xs"
          >
            <Maximize2 size={13} />
            <span className="hidden sm:inline font-mono text-[10px] uppercase font-bold">Lockdown Mode</span>
          </button>
        </div>
      )}

      {/* FOCUS TIMER CHRONOMETER ENGINE */}
      <div className="my-auto space-y-8 flex flex-col items-center">
        {/* Glowing Clock ring around timer */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-2xl relative group">
          {/* Animated pulsing outer halo when timer is actively running */}
          {focusSession.isActive && !focusSession.isPaused && (
            <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping opacity-60 scale-105 pointer-events-none" />
          )}

          {/* SVG Progress Circle */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 p-1" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              strokeWidth="2.5"
              stroke="rgba(255, 255, 255, 0.03)"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              strokeWidth="3"
              stroke="url(#blue-gradient)"
              strokeDasharray="289"
              strokeDashoffset={289 - (289 * (focusSession.timeLeft / focusSession.duration))}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Core Time numbers */}
          <div className="flex flex-col items-center z-10 space-y-1 select-none">
            <span className="font-mono font-bold text-5xl md:text-7xl text-zinc-100 tracking-widest leading-none drop-shadow-md">
              {formatTime(focusSession.timeLeft)}
            </span>
            <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-semibold mt-1">
              {!focusSession.isActive ? 'CHAMBER READY' : focusSession.isPaused ? 'LOCK PAUSED' : 'CONCENTRATING'}
            </span>
          </div>
        </div>

        {/* ACTIVE TASK NODE BAR WITH MISSION DIRECTIVES */}
        <div className="w-full max-w-lg bg-zinc-950/80 border border-zinc-900 backdrop-blur-md p-5 rounded-2xl relative text-left shadow-xl space-y-4">
          {activeTask ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-400 uppercase tracking-wider">
                  <Sparkles size={12} className="text-blue-400" />
                  <span>CHAMBER CORE PROTOCOL</span>
                </div>
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest">DUE {activeTask.deadline}</span>
              </div>

              <div className="space-y-1">
                <h4 className="font-sans font-bold text-sm text-zinc-100">{activeTask.title}</h4>
                <p className="font-sans text-xs text-zinc-400 leading-normal">{activeTask.description}</p>
              </div>

              {/* DYNAMIC REAL-TIME AGENT FOCUS DIRECTIVES */}
              {focusSession.isActive && (
                <div className="border-t border-zinc-900/60 pt-3.5 space-y-3">
                  <div className="flex items-center gap-1.5 font-mono text-[8px] text-purple-400 uppercase tracking-widest font-semibold">
                    <Zap size={11} className="animate-pulse" />
                    <span>AI OPERATIONAL DIRECTIVES</span>
                  </div>

                  {loadingDirectives ? (
                    <div className="space-y-3 bg-zinc-900/40 p-4 rounded-xl border border-zinc-900 font-sans">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-zinc-400 text-xs animate-pulse">{msgs[thinkingMsg]}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 w-3/4 bg-zinc-800 rounded animate-pulse"></div>
                        <div className="h-2 w-1/2 bg-zinc-800 rounded animate-pulse"></div>
                      </div>
                    </div>
                  ) : directives ? (
                    <div className="space-y-2.5 bg-zinc-900/40 p-3 rounded-xl border border-zinc-900 font-sans">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">IMMEDIATE NEXT MOVE</span>
                        <p className="text-xs text-zinc-200 font-medium leading-relaxed">{directives.nextAction}</p>
                      </div>

                      {directives.motivation && (
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">ADAPTIVE STRATEGY</span>
                          <p className="text-xs text-zinc-400 italic leading-relaxed">"{directives.motivation}"</p>
                        </div>
                      )}

                      {directives.cognitiveLoad && (
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">COGNITIVE LOAD</span>
                          <p className="text-[11px] text-zinc-400 leading-normal">{directives.cognitiveLoad}</p>
                        </div>
                      )}

                      {directives.microAdjustments && directives.microAdjustments.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-zinc-900/50">
                          <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 block">ENVIRONMENT MODIFIERS</span>
                          <div className="flex flex-wrap gap-1.5">
                            {directives.microAdjustments.map((adj: string, idx: number) => (
                              <span key={idx} className="bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300 font-mono px-2 py-0.5 rounded-md">
                                {adj}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1 border-t border-zinc-900/50">
                <button 
                  onClick={handleCompleteCurrentTask}
                  className="bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/20 text-emerald-400 font-sans text-[10px] font-semibold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check size={11} />
                  <span>Mark Completed</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-2 text-center text-zinc-500 font-sans text-xs space-y-2">
              <AlertCircle size={18} className="mx-auto text-zinc-600" />
              <p>No task coupled to active timer chamber.</p>
              <p className="text-[10px] text-zinc-600">You can link target tasks via your Console Queue.</p>
            </div>
          )}
        </div>

        {/* CONTROL OPERATIONS */}
        <div className="flex items-center gap-4">
          {focusSession.isActive ? (
            <>
              <button 
                onClick={focusSession.isPaused ? resumeFocusSession : pauseFocusSession}
                className="bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 p-3.5 rounded-full transition-colors cursor-pointer"
              >
                {focusSession.isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} />}
              </button>
              
              <button 
                onClick={handleResetTimer}
                className="bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-zinc-900 p-3.5 rounded-full transition-colors cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw size={16} />
              </button>
            </>
          ) : (
            <button 
              onClick={() => startFocusSession(focusSession.taskId, 25)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-sans text-xs font-semibold px-6 py-3 rounded-full transition-all shadow-lg shadow-blue-600/15 flex items-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <Play size={14} fill="currentColor" />
              <span>Initialize Focus Tunnel</span>
            </button>
          )}
        </div>
      </div>

      {/* AUDIO AMBIENT CONTROLLERS (Hide in minimalist fullscreen) */}
      {!fullscreenFocus && (
        <div className="border-t border-white/5 pt-6 space-y-4 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-mono text-[9px] text-slate-500 block uppercase font-medium">BINAURAL FOCUS FREQUENCIES</span>
            <div className="bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg text-[10px] text-purple-300 font-sans flex items-center gap-1.5 max-w-lg">
              <Sparkles size={11} className="text-purple-400 animate-pulse" />
              <span><strong>AI Recommended track:</strong> {recommendation.reason}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {soundOptions.map((opt) => {
              const isSelected = focusSession.soundType === opt.type;
              const isRecommended = recommendation.type === opt.type;
              return (
                <div 
                  key={opt.type}
                  onClick={() => setFocusSoundType(opt.type)}
                  className={`border p-3.5 rounded-xl cursor-pointer transition-all space-y-1 relative overflow-hidden ${
                    isSelected 
                      ? 'bg-white/10 border-white/10' 
                      : isRecommended
                        ? 'bg-purple-500/5 border-purple-500/20 hover:border-purple-500/35'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}
                >
                  {isRecommended && (
                    <span className="absolute top-0 right-0 bg-purple-600/25 border-b border-l border-purple-500/30 text-[8px] font-mono text-purple-300 font-bold px-1.5 py-0.5 rounded-bl">
                      RECOMMENDED
                    </span>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-bold text-zinc-200 text-xs">{opt.label}</span>
                    {isSelected ? (
                      <Volume2 size={13} className="text-blue-400 animate-pulse" />
                    ) : (
                      <VolumeX size={13} className="text-zinc-600" />
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-normal">{opt.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
