import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Bell, 
  Clock, 
  Plus, 
  X, 
  Check, 
  Sparkles, 
  Menu, 
  AlertTriangle,
  LogOut,
  HelpCircle,
  Cpu
} from 'lucide-react';

export const TopNav: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    notifications, 
    dismissNotification, 
    clearAllNotifications,
    sidebarOpen,
    setSidebarOpen,
    setCurrentPage,
    addTask,
    tasks
  } = useApp();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  
  // Real-time dynamic clock
  const [systemTime, setSystemTime] = useState<string>('');
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: 06:14:51 UTC (SaaS precision standard)
      setSystemTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Quick Task Add form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [taskCategory, setTaskCategory] = useState('Engineering');
  const [taskDeadline, setTaskDeadline] = useState(new Date().toISOString().split('T')[0]);

  // Minimum allowed date: 7 days ago
  const minAllowedDate = new Date();
  minAllowedDate.setDate(minAllowedDate.getDate() - 7);
  const minDateString = minAllowedDate.toISOString().split('T')[0];

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle,
      description: 'Quick scheduled action via Control Navigation.',
      status: 'todo',
      priority: taskPriority,
      deadline: taskDeadline,
      estimatedHours: 2,
      actualHours: 0,
      subtasks: [],
      tags: ['Quick-Add'],
      risk: taskPriority === 'critical' || taskPriority === 'high' ? 'medium' : 'low',
      category: taskCategory
    });

    setTaskTitle('');
    setQuickAddOpen(false);
  };

  return (
    <>
      <header 
        id="top-nav"
        className="sticky top-0 right-0 w-full h-16 bg-black/20 backdrop-blur-md border-b border-white/5 px-4 md:px-8 flex items-center justify-between z-30"
      >
      {/* Search and Mobile Sidebar Trigger */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <button 
          id="mobile-sidebar-trigger"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded-lg"
        >
          <Menu size={16} />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search tasks, priorities, plans..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-xs text-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder-slate-500 font-sans"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Global Status Center */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        {/* Metric Sync Clock */}
        <div className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1 font-mono text-[11px] text-slate-400">
          <Clock size={12} className="text-blue-500 animate-pulse" />
          <span>SYSTEM TIME:</span>
          <span className="text-slate-200 font-semibold tracking-wider">{systemTime}</span>
        </div>

        {/* Quick Plan Shortcuts */}
        <button 
          onClick={() => setCurrentPage('planner')}
          className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/15 hover:to-purple-500/15 border border-blue-500/20 rounded-full px-3 py-1 font-sans text-xs text-blue-400 hover:text-blue-300 transition-all"
        >
          <Sparkles size={12} />
          <span>AI Task Draft</span>
        </button>

        {/* Quick Task Injector Button */}
        <button 
          onClick={() => setQuickAddOpen(true)}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-medium px-3 py-1.5 rounded-full transition-colors shadow-lg shadow-blue-600/15 cursor-pointer"
        >
          <Plus size={14} />
          <span className="hidden xs:inline">Quick Add</span>
        </button>

        {/* System Notification bell */}
        <div className="relative">
          <button 
            id="notifications-bell"
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="p-2 bg-white/5 border border-white/10 hover:border-white/20 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer relative"
          >
            <Bell size={14} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#030305]"></span>
            )}
          </button>

          {/* Floating Dropdown */}
          {notifDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl p-4 z-50 text-left">
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <span className="font-sans font-semibold text-xs text-slate-200">System Logs</span>
                {notifications.length > 0 && (
                  <button 
                    onClick={clearAllNotifications}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-mono"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 font-sans text-xs">
                    No active network exceptions.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-2.5 rounded-lg border flex gap-2.5 ${
                        notif.read ? 'bg-white/[0.02] border-white/5' : 'bg-white/[0.05] border-white/10'
                      }`}
                    >
                      <div className="mt-0.5">
                        {notif.type === 'success' ? (
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        ) : (
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-medium text-xs text-slate-200 truncate">{notif.title}</p>
                        <p className="font-sans text-[10px] text-slate-400 mt-0.5 leading-normal">{notif.desc}</p>
                        <span className="font-mono text-[9px] text-slate-500 block mt-1">{notif.time}</span>
                      </div>
                      <button 
                        onClick={() => dismissNotification(notif.id)}
                        className="text-slate-500 hover:text-slate-300 self-start"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI Status Indicators */}
        <div className="hidden md:flex flex-col items-end text-right select-none ml-2">
          <span className="text-[10px] text-slate-500 font-mono leading-none">AI STATUS</span>
          <span className="text-[10px] text-blue-400 font-medium font-sans mt-1 leading-none">Optimizer Active</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border border-white/10 shrink-0"></div>
      </div>
      </header>

      {/* QUICK ADD MODAL DIALOG */}
      {quickAddOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a0f] border border-zinc-800 rounded-2xl shadow-2xl p-6 relative">
            <button 
              onClick={() => setQuickAddOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Cpu size={16} />
              </div>
              <h3 className="font-sans font-bold text-sm text-zinc-100 uppercase tracking-wider">Quick Inject Task</h3>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] text-zinc-500 mb-1.5 uppercase">TASK TITLE</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Audit authentication secret routes"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-[#050508] border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] text-zinc-500 mb-1.5 uppercase">PRIORITY</label>
                  <select 
                    value={taskPriority}
                    onChange={(e: any) => setTaskPriority(e.target.value)}
                    className="w-full bg-[#050508] border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] text-zinc-500 mb-1.5 uppercase">CATEGORY</label>
                  <select 
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value)}
                    className="w-full bg-[#050508] border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Optimization">Optimization</option>
                    <option value="Design">UI/UX Design</option>
                    <option value="Education">Education</option>
                    <option value="Billing">Billing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-zinc-500 mb-1.5 uppercase">DUE DATE</label>
                <input 
                  type="date" 
                  required
                  min={minDateString}
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                  className="w-full bg-[#050508] border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2.5 rounded-lg transition-colors mt-2"
              >
                Inject Task
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
