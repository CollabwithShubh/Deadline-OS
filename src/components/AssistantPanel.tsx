import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Send, 
  Sparkles, 
  Terminal, 
  X, 
  HelpCircle, 
  Zap, 
  ShieldAlert,
  Compass,
  Cpu,
  RefreshCw,
  Check
} from 'lucide-react';

export const AssistantPanel: React.FC = () => {
  const { 
    aiMessages, 
    sendAIMessage, 
    assistantOpen, 
    setAssistantOpen,
    setCurrentPage,
    approvePlan,
    plans,
    triggerRescueMode
  } = useApp();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [aiMessages, assistantOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendAIMessage(input);
    setInput('');
  };

  const handleCommandClick = (command: string) => {
    if (command === '/rescue') {
      triggerRescueMode('Backlog congestion detected. Automated emergency triage activated.');
    } else if (command === '/plan') {
      setCurrentPage('planner');
      sendAIMessage('I want to compile a plan for a new objective');
    } else {
      sendAIMessage(command);
    }
  };

  if (!assistantOpen) {
    return (
      <button 
        id="assistant-dock-trigger"
        onClick={() => setAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-tr from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white p-3.5 rounded-full shadow-[0_4px_20px_rgba(59,130,246,0.4)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.6)] cursor-pointer transition-all border border-blue-400/30 group animate-bounce"
      >
        <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  return (
    <div 
      id="assistant-sidebar-panel"
      className="fixed top-0 right-0 h-full w-80 md:w-96 bg-black/40 backdrop-blur-md border-l border-white/5 shadow-2xl flex flex-col z-50 transition-all duration-300"
    >
      {/* Header */}
      <div className="h-16 border-b border-white/5 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Terminal size={14} />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-xs text-white uppercase tracking-wider">COGNITIVE COMPLIANCE</span>
            <span className="font-mono text-[9px] text-emerald-400 uppercase tracking-widest leading-none mt-0.5">SECURE CONNECTION</span>
          </div>
        </div>

        <button 
          onClick={() => setAssistantOpen(false)}
          className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {aiMessages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div 
              key={msg.id} 
              className={`flex flex-col max-w-[85%] ${isAI ? 'self-start' : 'self-end ml-auto'}`}
            >
              {/* Message bubble */}
              <div 
                className={`p-3 rounded-xl border leading-relaxed ${
                  isAI 
                    ? msg.type === 'rescue' 
                      ? 'bg-red-500/5 border-red-500/20 text-red-100 shadow-[inset_0_1px_1px_rgba(239,68,68,0.1)]' 
                      : msg.type === 'suggest_plan'
                      ? 'bg-purple-500/5 border-purple-500/20 text-purple-100'
                      : 'bg-white/[0.03] border-white/5 text-slate-200' 
                    : 'bg-blue-600/10 border-blue-500/20 text-blue-100'
                }`}
              >
                {msg.text}

                {/* Subtask / Plan Injection Helper in Assistant Chat */}
                {msg.type === 'suggest_plan' && msg.meta?.planId && (
                  <div className="mt-3 pt-2.5 border-t border-purple-500/10 space-y-2">
                    <span className="font-mono text-[9px] text-purple-400 uppercase font-semibold">COGNITIVE BLUEPRINT COMPILED</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setCurrentPage('planner');
                          setAssistantOpen(false);
                        }}
                        className="flex-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-sans text-[10px] font-semibold py-1 px-2 rounded border border-purple-500/30 transition-all text-center"
                      >
                        Review Timeline
                      </button>
                      <button 
                        onClick={() => approvePlan(msg.meta.planId)}
                        className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-sans text-[10px] font-semibold py-1 px-2 rounded transition-all text-center"
                      >
                        Approve & Sync
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <span className="font-mono text-[8px] text-zinc-600 mt-1 px-1">
                {msg.sender === 'ai' ? 'DeadlineOS Core' : 'Operator'} • {msg.timestamp}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Command Hub */}
      <div className="px-4 py-2 border-t border-white/5 bg-black/40">
        <span className="font-mono text-[9px] text-slate-500 block mb-1.5 uppercase">SYSTEM MACROS</span>
        <div className="flex flex-wrap gap-1.5">
          <button 
            onClick={() => handleCommandClick('/status')}
            className="flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded px-2 py-1 font-mono text-[9px] text-slate-300 transition-colors"
          >
            <Cpu size={10} className="text-emerald-400" />
            <span>/status</span>
          </button>
          <button 
            onClick={() => handleCommandClick('/plan')}
            className="flex items-center gap-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded px-2 py-1 font-mono text-[9px] text-slate-300 transition-colors"
          >
            <Compass size={10} className="text-purple-400" />
            <span>/plan</span>
          </button>
          <button 
            onClick={() => handleCommandClick('/rescue')}
            className="flex items-center gap-1 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1 font-mono text-[9px] text-amber-400 transition-colors"
          >
            <ShieldAlert size={10} className="text-amber-500 animate-pulse" />
            <span>/rescue</span>
          </button>
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/5 bg-black/40">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Type message to DeadlineOS..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-4 pr-10 text-xs text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
          />
          <button 
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors cursor-pointer"
          >
            <Send size={11} />
          </button>
        </div>
      </form>
    </div>
  );
};
