import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { 
  Chrome, 
  Cpu, 
  ShieldCheck, 
  Timer,
  AlertCircle
} from 'lucide-react';
import StarryBackground from '../components/StarryBackground';

export const AuthPage: React.FC = () => {
  const { setCurrentPage, updateProfile } = useApp();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOAuthLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // Let AppContext's onAuthStateChanged handle the backend sync and state updates
      // setCurrentPage is also handled by onAuthStateChanged when it completes
    } catch (err: any) {
      console.error(err);
      let msg = err.message || 'OAuth Connection failed.';
      if (msg.includes('auth/popup-closed-by-user')) msg = 'Authentication handshake terminated by user.';
      else if (msg.includes('auth/cancelled-popup-request')) msg = 'Multiple handshake requests detected. Please try again.';
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-split-layout" className="min-h-screen bg-[#020204] text-zinc-100 flex flex-col md:flex-row font-sans selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Brand Visual Left Panel */}
      <div className="flex-1 bg-[#040407] border-r border-zinc-900/60 p-8 sm:p-12 md:p-16 flex flex-col justify-between relative overflow-hidden">
        <StarryBackground />
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-tr from-blue-600/10 to-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Logo and title */}
        <div 
          onClick={() => setCurrentPage('landing')}
          className="flex items-center gap-2 cursor-pointer z-10 self-start"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-mono font-bold text-sm tracking-tighter text-white">
            D
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-bold tracking-tight text-zinc-100 text-sm leading-none">DeadlineOS</span>
            <span className="font-mono text-[9px] text-blue-500 uppercase tracking-widest mt-0.5 font-semibold">COGNITIVE SHELL</span>
          </div>
        </div>

        {/* Dynamic Marketing copy */}
        <div className="my-12 md:my-auto max-w-md lg:max-w-xl 2xl:max-w-2xl space-y-8 md:space-y-10 z-10 2xl:mx-auto">
          <h2 className="font-sans font-bold text-3xl sm:text-4xl lg:text-5xl text-zinc-100 tracking-tight leading-snug">
            Establish Secure Connection <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">To Your Work Sandbox.</span>
          </h2>

          <div className="space-y-6 lg:space-y-8 font-sans text-sm lg:text-base text-zinc-400">
            <div className="flex gap-4 items-start">
              <div className="p-2 h-9 w-9 lg:h-12 lg:w-12 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <p className="leading-relaxed mt-1 lg:mt-2">
                <strong className="text-zinc-200 block mb-1">AI compliance engine:</strong> Automatically compiles logical task trees from unstructured thoughts.
              </p>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-2 h-9 w-9 lg:h-12 lg:w-12 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <p className="leading-relaxed mt-1 lg:mt-2">
                <strong className="text-zinc-200 block mb-1">Urgent backlog rescue:</strong> Restructures timelines in real-time when deadlines pile up.
              </p>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-2 h-9 w-9 lg:h-12 lg:w-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Timer className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <p className="leading-relaxed mt-1 lg:mt-2">
                <strong className="text-zinc-200 block mb-1">Focused focus timer:</strong> Deep work countdowns synced directly to critical action steps.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-zinc-600 font-mono text-[9px] z-10 self-start">
          SECURE PROTOCOL • VERSION 1.4.2 • 256-BIT SYMMETRIC ENCRYPTION
        </div>
      </div>

      {/* Login Portal Right Panel */}
      <div className="flex-1 p-8 sm:p-12 md:p-16 flex items-center justify-center bg-[#020204] relative overflow-hidden">
        <StarryBackground />
        
        {/* Glow Effects for the right side */}
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-gradient-to-tr from-blue-600/5 to-purple-600/5 rounded-full blur-[120px] pointer-events-none z-10" />
        
        <div className="relative group w-full max-w-lg z-20">
          {/* Continuous RGB Gradient Glow */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 opacity-0 group-hover:opacity-75 blur-md transition-opacity duration-1000 group-hover:duration-500 animate-gradient-xy pointer-events-none"></div>

          <div className="relative w-full space-y-8 bg-[#040407]/90 backdrop-blur-xl p-10 md:p-14 rounded-3xl border border-zinc-800/50 shadow-2xl shadow-black">
            <div className="space-y-2 text-center">
            <h3 className="font-sans font-bold text-2xl text-zinc-100 tracking-tight">
              Authenticate Console
            </h3>
            <p className="font-sans text-sm text-zinc-400">
              Sign in to sync your active sprint roadmaps.
            </p>
          </div>

          {error && (
            <div className="relative overflow-hidden bg-red-950/20 border border-red-900/50 p-4 rounded-xl flex items-start gap-3 shadow-lg shadow-red-900/10 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500/80"></div>
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1 space-y-1">
                <p className="font-mono text-[10px] text-red-400/70 uppercase tracking-wider font-semibold">System Alert</p>
                <p className="text-xs text-red-300 leading-relaxed break-words font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Social OAuth Google Button */}
          <button 
            disabled={loading}
            onClick={handleOAuthLogin}
            className="w-full bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl py-3.5 px-4 text-sm font-medium text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 shadow-lg shadow-black/20"
          >
            <Chrome size={16} className="text-blue-500" />
            <span>Continue with Google Workspace</span>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};
