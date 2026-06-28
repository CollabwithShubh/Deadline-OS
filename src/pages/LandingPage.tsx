import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldAlert, 
  Timer, 
  BarChart3, 
  Lock, 
  Clock, 
  Cpu, 
  CheckCircle2, 
  AlertOctagon,
  ChevronRight
} from 'lucide-react';
import Loader from '../components/Loader';
import Pattern from '../components/Pattern';

export const LandingPage: React.FC = () => {
  const { setCurrentPage, triggerDemoMode } = useApp();
  const [demoLoading, setDemoLoading] = React.useState(false);

  const handleDemoClick = async () => {
    if (demoLoading) return;
    setDemoLoading(true);
    await triggerDemoMode();
    setDemoLoading(false);
    setCurrentPage('dashboard');
  };

  const features = [
    {
      title: 'NLP Planner Compilation',
      desc: 'Type rough objectives like "I have webhooks assignment tomorrow". Our compiler structures subtasks, schedules, and isolates immediate risk vectors.',
      icon: Sparkles,
      color: 'text-purple-400 border-purple-500/20 bg-purple-500/5'
    },
    {
      title: 'Emergency Rescue Lockdown',
      desc: 'Wasted your day? Tell the system. We instantly drop low-priority overhead, move non-urgent items, and focus you on a single recover mission.',
      icon: ShieldAlert,
      color: 'text-amber-400 border-amber-500/20 bg-amber-500/5'
    },
    {
      title: 'Binaural Focus Chambers',
      desc: 'Trigger interactive countdown chambers embedded with neural white noise and cyberpunk synth waves to isolate cognitive context.',
      icon: Timer,
      color: 'text-blue-400 border-blue-500/20 bg-blue-500/5'
    },
    {
      title: 'Compliance Forecasting',
      desc: 'Predict failure boundaries before they hit. Understand weekly compliance trend curves and identify high-risk overdue timelines.',
      icon: BarChart3,
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
    }
  ];

  const faqs = [
    {
      q: 'How does DeadlineOS differ from typical reminder apps?',
      a: 'We do not just pop up alerts that you can snooze. DeadlineOS acts as a proactive task compiler. It schedules realistic time buffers, analyzes cognitive load, triggers deep focus chambers, and compiles emergency triage schedules when backlog overflows.'
    },
    {
      q: 'Does it integrate with current calendar schedules?',
      a: 'Yes. It maps Google Calendar, GitHub logs, and local task databases to build a single authoritative chronological timeline.'
    },
    {
      q: 'What is "Rescue Mode"?',
      a: 'Rescue Mode is an emergency system override. When you run out of time or hit a backlog block, DeadlineOS triages your tasks into Keep, Move, or Drop categories, allowing you to regain full momentum in under 45 minutes.'
    }
  ];

  return (
    <div id="landing-container" className="min-h-screen bg-[#020204] text-zinc-100 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Navbar */}
      <header className="sticky top-0 bg-[#020204]/80 backdrop-blur-md border-b border-zinc-900/40 h-16 px-6 md:px-12 flex items-center justify-between z-50">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-mono font-bold text-sm tracking-tighter text-white">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-bold tracking-tight text-zinc-100 text-sm leading-none">DeadlineOS</span>
            <span className="font-mono text-[9px] text-blue-500 uppercase tracking-widest mt-0.5 font-semibold">V1 PROT</span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6 text-xs text-zinc-400 font-sans">
          <a href="#features" className="hover:text-zinc-100 transition-colors">Features</a>
          <a href="#demo" className="hover:text-zinc-100 transition-colors">OS Sandbox</a>
          <a href="#faq" className="hover:text-zinc-100 transition-colors">FAQ</a>
        </div>

        <button 
          onClick={() => setCurrentPage('auth')}
          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full px-4 py-1.5 text-xs text-zinc-100 font-medium transition-colors cursor-pointer"
        >
          Initialize OS
        </button>
      </header>

      {/* Hero Block */}
      <section className="relative z-0 px-6 pt-20 pb-16 md:py-32 w-full text-center space-y-6 overflow-hidden">
        <Pattern />

        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-2xl border border-white/20 px-4 py-1.5 rounded-full text-[10px] text-zinc-100 font-mono tracking-wider uppercase font-bold relative z-10 shadow-2xl">
          <Cpu size={12} className="animate-spin text-blue-400" />
          <span>PROACTIVE COMPLIANCE INFRASTRUCTURE</span>
        </div>

        <h1 className="font-sans font-bold text-4xl sm:text-6xl tracking-tight text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] max-w-3xl mx-auto leading-[1.1] relative z-10">
          Stop Missing Deadlines. <br />
          <span className="bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">Your AI gets things done.</span>
        </h1>

        <p className="font-sans text-sm sm:text-lg text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] font-medium max-w-xl mx-auto leading-relaxed relative z-10">
          The ultimate productivity cockpit for developers. We deconstruct fuzzy goals, auto-schedule execution runs, block distractions, and rescue your backlogs.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 relative z-10">
          <div className="relative w-full sm:w-auto group/btn">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-full blur-lg opacity-0 group-hover/btn:opacity-100 transition duration-500 group-hover/btn:duration-200"></div>
            <button 
              onClick={() => setCurrentPage('auth')}
              className="relative w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs rounded-full px-6 py-3 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Let's make a better U</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          
          <button 
            onClick={handleDemoClick}
            disabled={demoLoading}
            className={`relative bg-[#07070a]/90 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs rounded-full transition-colors flex items-center justify-center cursor-pointer disabled:opacity-100 ${demoLoading ? 'p-0 w-full sm:w-[220px] h-[42px] overflow-hidden' : 'w-full sm:w-auto px-6 py-3 gap-1.5 disabled:opacity-50'}`}
          >
            {demoLoading ? (
              <Loader />
            ) : (
              <span>Bypass Auth (Quick Demo)</span>
            )}
          </button>
        </div>
      </section>

      {/* Interactive Mockup/Screenshot Section */}
      <section id="demo" className="px-6 pb-24 max-w-5xl mx-auto">
        <div className="border border-zinc-900 rounded-2xl bg-[#030306]/80 p-3 sm:p-4 shadow-2xl relative overflow-hidden group">
          {/* Glass background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
          
          {/* Window control circles */}
          <div className="flex items-center gap-2 mb-3 px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
            <span className="font-mono text-[9px] text-zinc-600 ml-2">deadlineos_shell.exe</span>
          </div>

          {/* Simulated Interface Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border border-zinc-900/80 rounded-xl bg-[#040407] p-4 text-left">
            {/* Nav Column */}
            <div className="border border-zinc-900/60 rounded-lg p-3 bg-zinc-950/40 space-y-4">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">CHANNELS</span>
              <div className="space-y-1.5">
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] p-2 rounded font-medium flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full animate-ping" />
                  <span>Command Center</span>
                </div>
                <div className="text-zinc-500 hover:text-zinc-300 text-[11px] p-2 rounded flex items-center gap-2">
                  <span>AI Plan Compiler</span>
                </div>
                <div className="text-zinc-500 hover:text-zinc-300 text-[11px] p-2 rounded flex items-center gap-2">
                  <span>Deep Lock Rooms</span>
                </div>
              </div>

              <div className="pt-8 space-y-2">
                <span className="font-mono text-[9px] text-zinc-500 block">COMPLIANCE INDEX</span>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[78%] rounded-full" />
                </div>
                <span className="font-mono text-[11px] text-zinc-300 block font-bold">78.4% RATE</span>
              </div>
            </div>

            {/* Main Column */}
            <div className="md:col-span-2 border border-zinc-900/60 rounded-lg p-4 bg-zinc-950/20 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-sans font-bold text-zinc-100 text-sm">Active Sprint Protocol</h4>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">ACTIVE</span>
                </div>

                <div className="space-y-2.5">
                  <div className="border border-zinc-900 bg-zinc-950 p-2.5 rounded flex items-center justify-between">
                    <div>
                      <p className="font-sans text-zinc-200 text-xs font-semibold">Verify Stripe cryptographic endpoints</p>
                      <span className="font-mono text-[9px] text-zinc-500 block mt-0.5">EST: 4.0h • TARGET: 17:00 UTC</span>
                    </div>
                    <span className="font-mono text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">CRITICAL</span>
                  </div>

                  <div className="border border-zinc-900 bg-zinc-950 p-2.5 rounded flex items-center justify-between opacity-60">
                    <div>
                      <p className="font-sans text-zinc-400 text-xs">Analyze topological sort graph complexities</p>
                      <span className="font-mono text-[9px] text-zinc-600 block mt-0.5">EST: 3.0h • Pushed via Rescue Triage</span>
                    </div>
                    <span className="font-mono text-[10px] bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded">MEDIUM</span>
                  </div>
                </div>
              </div>

              {/* Bottom Interactive Trigger Area */}
              <div className="border border-zinc-900 bg-zinc-950/80 p-3 rounded-lg flex items-center justify-between gap-3">
                <span className="font-sans text-zinc-400 text-xs truncate">Input raw criteria to structure an AI roadmap...</span>
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  Enter Sandbox
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grids */}
      <section id="features" className="px-6 py-20 bg-[#040407]/40 border-t border-b border-zinc-900/40">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-sans font-bold text-2xl sm:text-4xl text-zinc-100">Proactive Core Features</h2>
            <p className="font-sans text-sm text-zinc-400 max-w-lg mx-auto">
              Our infrastructure runs background engines tailored specifically to developers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx}
                  className="border border-zinc-900/60 bg-zinc-950/20 rounded-xl p-6 hover:border-zinc-800 transition-all group flex gap-4"
                >
                  <div className={`p-3 rounded-xl border self-start shrink-0 ${feat.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-sans font-bold text-sm text-zinc-200">{feat.title}</h3>
                    <p className="font-sans text-xs text-zinc-400 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="px-6 py-20 max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-sans font-bold text-2xl sm:text-4xl text-zinc-100">Engine Specifics</h2>
          <p className="font-sans text-sm text-zinc-400">
            How the DeadlineOS compiler guarantees execution.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-zinc-900/60 bg-zinc-950/10 p-5 rounded-xl space-y-2">
              <h4 className="font-sans font-bold text-sm text-zinc-200">{faq.q}</h4>
              <p className="font-sans text-xs text-zinc-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900/60 py-12 px-6 text-center text-zinc-500 font-sans text-xs space-y-3">
        <div className="flex items-center justify-center gap-1.5 font-sans font-bold text-zinc-400">
          <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-[10px] text-white">D</div>
          <span>DeadlineOS</span>
        </div>
        <p>© 2026 DeadlineOS Corporation. All rights reserved. Precision-grade execution environment.</p>
        <p className="font-mono text-[9px] text-zinc-600">MD-5: 4F2C91B860 • NETWORK OPTIMIZED • 0.0.0.0:3000</p>
      </footer>
    </div>
  );
};
