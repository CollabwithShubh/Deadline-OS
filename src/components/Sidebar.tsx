import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  LayoutGrid, 
  Sparkles, 
  ListTodo, 
  Timer, 
  BarChart3, 
  Settings, 
  User, 
  ShieldAlert, 
  Menu, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  Clock
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    currentPage, 
    setCurrentPage, 
    sidebarOpen, 
    setSidebarOpen, 
    user, 
    productivityScore,
    rescuePlan
  } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutGrid },
    { id: 'planner', label: 'AI Planner', icon: Sparkles, badge: 'AUTO' },
    { id: 'tasks', label: 'Task Console', icon: ListTodo },
    { id: 'execution', label: 'Deep Focus', icon: Timer },
    { id: 'analytics', label: 'Analytics Feed', icon: BarChart3 },
  ];

  const adminItems = [
    { id: 'profile', label: 'Operator File', icon: User },
    { id: 'settings', label: 'OS Settings', icon: Settings },
  ];

  return (
    <aside 
      id="main-sidebar"
      className={`fixed top-0 left-0 h-full bg-black/40 backdrop-blur-md border-r border-white/5 transition-all duration-300 z-40 flex flex-col ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        <div 
          onClick={() => setCurrentPage('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
            <div className="w-4 h-4 bg-white rounded-sm transform rotate-45 transition-transform group-hover:rotate-90 duration-500"></div>
          </div>
          {sidebarOpen && (
            <span className="font-sans font-bold text-xl tracking-tight text-white">DeadlineOS</span>
          )}
        </div>
        
        <button 
          id="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* AI Pulse Status Bar */}
      {sidebarOpen && (
        <div className="px-4 py-3 border-b border-white/5 bg-black/20">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] text-slate-500">AI COGNITIVE LOAD</span>
            <span className="font-mono text-[10px] text-blue-400 font-medium">OPTIMAL</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 w-1/4 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Main Routes */}
      <div className="flex-1 py-4 overflow-y-auto space-y-1.5 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              id={`sidebar-link-${item.id}`}
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-sans text-xs transition-all duration-150 group relative ${
                isActive 
                  ? 'bg-white/10 text-white font-medium border border-white/5' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200 transition-colors'} />
              {sidebarOpen && (
                <span className="truncate">{item.label}</span>
              )}
              {sidebarOpen && item.badge && (
                <span className="ml-auto font-mono text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30">
                  {item.badge}
                </span>
              )}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded text-xs opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}

        {/* Emergency Triage Status Indicator */}
        {rescuePlan && (
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              !sidebarOpen && 'p-2'
            }`}
          >
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            {sidebarOpen && <span className="font-semibold uppercase tracking-wider text-[10px]">RESCUE ACTIVE</span>}
          </button>
        )}
      </div>

      {/* Footer / System Control Panel */}
      <div className="p-3 border-t border-white/5 space-y-1.5">
        {adminItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              id={`sidebar-link-${item.id}`}
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-sans text-xs transition-all duration-150 group relative ${
                isActive 
                  ? 'bg-white/10 text-white font-medium border border-white/5' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon size={15} className="text-slate-400 group-hover:text-slate-200 transition-colors" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
              {!sidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-950 border border-zinc-800 text-zinc-200 rounded text-xs opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}

        {/* User Identity Unit */}
        {sidebarOpen && user && (
          <div 
            onClick={() => setCurrentPage('profile')}
            className="flex items-center gap-3 p-2 rounded-lg bg-zinc-950/60 border border-zinc-900/50 mt-2 cursor-pointer hover:bg-zinc-900/40 transition-colors"
          >
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-7 h-7 rounded-full object-cover border border-zinc-800"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-sans font-medium text-zinc-200 text-xs truncate leading-none">{user.name}</span>
                <span className="font-mono text-[8px] bg-blue-500/20 text-blue-400 px-1 rounded-full text-[9px] scale-90">
                  {user.tier}
                </span>
              </div>
              <span className="font-mono text-[9px] text-zinc-500 truncate mt-0.5">{user.email}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
