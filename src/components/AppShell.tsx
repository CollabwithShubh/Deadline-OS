import React from 'react';
import { useApp } from '../context/AppContext';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { AssistantPanel } from './AssistantPanel';
import { 
  LayoutGrid, 
  Sparkles, 
  ListTodo, 
  Timer, 
  BarChart3, 
  Settings, 
  Compass,
  Cpu
} from 'lucide-react';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    sidebarOpen, 
    currentPage, 
    setCurrentPage, 
    fullscreenFocus 
  } = useApp();

  // Bottom Navigation Items for Mobile viewports
  const bottomNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutGrid },
    { id: 'planner', label: 'Planner', icon: Sparkles },
    { id: 'tasks', label: 'Console', icon: ListTodo },
    { id: 'execution', label: 'Focus', icon: Timer },
    { id: 'analytics', label: 'Stats', icon: BarChart3 }
  ];

  // If in active fullscreen execution mode, we hide headers and sidebars entirely to force focus!
  if (fullscreenFocus && currentPage === 'execution') {
    return (
      <div id="app-shell-fullscreen" className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-blue-500/30 selection:text-blue-200">
        <main className="w-full">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div id="app-shell-root" className="min-h-screen bg-[#050505] text-slate-200 font-sans flex select-none selection:bg-blue-500/30 selection:text-blue-200">
      
      {/* Sidebar for Desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main viewport Container */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 min-h-screen ${
          sidebarOpen ? 'md:pl-64' : 'md:pl-16'
        }`}
      >
        {/* Top Control Bar */}
        <TopNav />

        {/* Content Node */}
        <main className="flex-1 overflow-x-hidden pb-8">
          {children}
        </main>

        {/* FLOATING STATUS BAR */}
        <div className="hidden md:flex px-8 py-3 bg-black border-t border-white/5 items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-500">
          <div className="flex items-center gap-6">
            <span>Status: Synced</span>
            <span>Latency: 14ms</span>
            <span>Server: us-east-ai-v1</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Online
            </span>
            <span>v1.0.4-Stable</span>
          </div>
        </div>
      </div>

      {/* Embedded Assistant Node */}
      <AssistantPanel />

      {/* Mobile Bottom Navigation Bar (Floating Dock) */}
      <nav 
        id="mobile-bottom-nav"
        className="md:hidden fixed bottom-4 left-4 right-4 h-14 bg-zinc-950/90 border border-zinc-900 backdrop-blur-xl rounded-full px-6 flex items-center justify-between z-45 shadow-2xl shadow-black/80"
      >
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              id={`mobile-nav-${item.id}`}
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center justify-center p-1.5 transition-colors relative ${
                isActive ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon size={18} />
              <span className="text-[9px] font-sans mt-0.5">{item.label}</span>
              {isActive && (
                <span className="absolute -top-1 w-1 h-1 bg-blue-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
