import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Task, TaskPriority, TaskStatus } from '../types';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  X, 
  Check, 
  Timer, 
  Briefcase, 
  ShieldAlert,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  AlertOctagon,
  TrendingUp,
  RefreshCw,
  Cpu,
  Bookmark
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleSubtask, 
    startFocusSession, 
    searchQuery, 
    setSearchQuery,
    dataSyncing
  } = useApp();

  const [view, setView] = useState<'board' | 'list' | 'calendar'>('board');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Filtering and Sorting States
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // New task creation states
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDeadline, setNewDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [newEst, setNewEst] = useState(2);
  const [newCat, setNewCat] = useState('Engineering');
  const [newTags, setNewTags] = useState('Sprint-1');

  const categories = ['All', 'Engineering', 'Billing', 'Education', 'Creative', 'Optimization'];

  // Handle Filtering
  const filteredTasks = tasks.filter(task => {
    // Search query filter
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    // Category filter
    const matchesCategory = categoryFilter === 'All' || task.category === categoryFilter;

    // Priority filter
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;

    // Status filter
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle,
      description: newDesc || 'No manual description provided. Scheduled via Operator Task Shell.',
      status: 'todo',
      priority: newPriority,
      deadline: newDeadline,
      estimatedHours: Number(newEst) || 2,
      actualHours: 0,
      subtasks: [
        { id: `${Date.now()}-1`, title: 'Define interface bounds and entry targets', completed: false },
        { id: `${Date.now()}-2`, title: 'Compile unit schemas & execute linter tests', completed: false }
      ],
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      risk: newPriority === 'critical' || newPriority === 'high' ? 'high' : 'low',
      category: newCat
    });

    // Clear form
    setNewTitle('');
    setNewDesc('');
    setNewEst(2);
    setCreateOpen(false);
  };

  const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask({
        ...task,
        status: newStatus
      });
      // Update selected task reference if viewing detail
      if (selectedTask?.id === taskId) {
        setSelectedTask({ ...task, status: newStatus });
      }
    }
  };

  const handleDeleteTaskClick = (id: string) => {
    deleteTask(id);
    setSelectedTask(null);
  };

  const getPriorityColorClass = (priority: TaskPriority) => {
    switch (priority) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/25';
      case 'high': return 'text-amber-400 bg-amber-500/10 border-amber-500/25';
      case 'medium': return 'text-blue-400 bg-blue-500/10 border-blue-500/25';
      default: return 'text-zinc-500 bg-zinc-950 border-zinc-900';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'Backlog';
      case 'in_progress': return 'Active Sprint';
      case 'overdue': return 'Overdue Alert';
      default: return 'Completed';
    }
  };

  return (
    <div id="tasks-viewport" className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto text-left font-sans">
      
      {/* HEADER CONTROLS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-light tracking-tight text-white">Sprint Task Console</h2>
          <p className="text-xs text-slate-400 leading-normal max-w-md">Manage, filter, and schedule atomic components of your active project workspace.</p>
        </div>

        {/* View Layout Selector Controls */}
        <div className="flex items-center gap-2">
          <div className="bg-zinc-950 border border-zinc-900 p-0.5 rounded-xl flex items-center shrink-0">
            <button 
              onClick={() => setView('board')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${view === 'board' ? 'bg-zinc-900 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Grid size={14} />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${view === 'list' ? 'bg-zinc-900 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <List size={14} />
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${view === 'calendar' ? 'bg-zinc-900 text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Calendar size={14} />
            </button>
          </div>

          <button 
            onClick={() => setCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          >
            <Plus size={15} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-md p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Categories Selector */}
          <div className="flex items-center gap-1">
            <span className="font-mono text-[9px] text-slate-500 uppercase tracking-wider mr-1">Category:</span>
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`text-[10px] px-2.5 py-1 rounded-full transition-all border ${
                    categoryFilter === cat 
                      ? 'bg-white/15 text-white border-white/10' 
                      : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative w-full max-w-xs sm:w-auto">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Filter keys, titles, labels..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 rounded-full py-1.5 pl-8 pr-4 text-xs text-zinc-300 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* VIEWS PRESENTATION CHANNELS */}
      {view === 'board' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          
          {/* Backlog Columns config */}
          {(['todo', 'in_progress', 'overdue', 'completed'] as TaskStatus[]).map((status) => {
            const columnTasks = filteredTasks.filter(t => t.status === status);
            return (
              <div key={status} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                {/* Column header */}
                <div className="flex items-center justify-between border-b border-zinc-900/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      status === 'todo' ? 'bg-zinc-400' :
                      status === 'in_progress' ? 'bg-blue-400' :
                      status === 'overdue' ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'
                    }`} />
                    <span className="font-sans font-bold text-xs text-zinc-200 uppercase tracking-wider">
                      {getStatusLabel(status)}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded-md">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Cards listing */}
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {dataSyncing && tasks.length === 0 ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="bg-white/[0.03] border border-white/[0.08] p-3.5 rounded-xl space-y-3 animate-pulse">
                        <div className="flex gap-2">
                           <div className="h-3 w-10 bg-zinc-800 rounded"></div>
                           <div className="h-3 w-16 bg-zinc-800 rounded"></div>
                        </div>
                        <div className="h-4 w-3/4 bg-zinc-800 rounded"></div>
                        <div className="h-3 w-full bg-zinc-800 rounded"></div>
                        <div className="h-3 w-full bg-zinc-800 rounded"></div>
                      </div>
                    ))
                  ) : columnTasks.length === 0 ? (
                    <div className="py-8 border border-dashed border-zinc-900/60 bg-[#050508]/50 text-center text-zinc-600 rounded-xl font-sans text-[10px]">
                      No active items.
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <div 
                        onClick={() => setSelectedTask(task)}
                        key={task.id}
                        className="bg-white/[0.03] border border-white/[0.08] hover:border-white/10 p-3.5 rounded-xl space-y-3 cursor-pointer transition-all hover:shadow-lg shadow-black/40 group relative overflow-hidden"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className={`font-mono text-[8px] uppercase px-1.5 py-0.5 rounded border ${getPriorityColorClass(task.priority)}`}>
                              {task.priority}
                            </span>
                            <span className="font-mono text-[9px] text-zinc-500">{task.category}</span>
                          </div>
                          
                          <h4 className="font-sans font-bold text-zinc-200 text-xs leading-snug group-hover:text-blue-400 transition-colors">{task.title}</h4>
                          <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">{task.description}</p>
                        </div>

                        {/* Progress Bar and Hours indicators */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60">
                          <span className="font-mono text-[9px] text-zinc-500">EST: {task.estimatedHours}h</span>
                          <span className="font-sans font-medium text-[9px] text-zinc-300">
                            {task.subtasks.length > 0 
                              ? `${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length} Checkpoints`
                              : 'No Checklist'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : view === 'list' ? (
        <div className="border border-white/5 bg-white/[0.02] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-black/40 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
                  <th className="py-3 px-4">Task Specs</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Est Hours</th>
                  <th className="py-3 px-4">Timeline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans text-xs">
                {dataSyncing && tasks.length === 0 ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-4"><div className="h-4 w-3/4 bg-zinc-800 rounded mb-1"></div><div className="h-3 w-1/2 bg-zinc-800 rounded"></div></td>
                      <td className="py-4 px-4"><div className="h-4 w-16 bg-zinc-800 rounded"></div></td>
                      <td className="py-4 px-4"><div className="h-4 w-12 bg-zinc-800 rounded"></div></td>
                      <td className="py-4 px-4"><div className="h-4 w-20 bg-zinc-800 rounded"></div></td>
                      <td className="py-4 px-4"><div className="h-4 w-8 bg-zinc-800 rounded"></div></td>
                      <td className="py-4 px-4"><div className="h-4 w-24 bg-zinc-800 rounded"></div></td>
                      <td className="py-4 px-4"><div className="h-6 w-16 bg-zinc-800 rounded ml-auto"></div></td>
                    </tr>
                  ))
                ) : filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500 font-sans">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <ShieldAlert size={20} className="text-zinc-600" />
                        <span className="text-sm font-semibold text-zinc-400">No active entries</span>
                        <span className="text-[10px] max-w-xs">Adjust your selectors or dispatch new tasks via the creation modal.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr 
                      key={task.id}
                      className="hover:bg-white/5 transition-colors cursor-pointer group"
                      onClick={() => setSelectedTask(task)}
                    >
                      <td className="py-4 px-4 max-w-sm">
                        <p className="font-bold text-zinc-200 group-hover:text-blue-400 transition-colors">{task.title}</p>
                        <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5 leading-normal">{task.description}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-mono text-[10px] ${
                          task.status === 'completed' ? 'text-emerald-400' :
                          task.status === 'overdue' ? 'text-red-400 font-medium' :
                          task.status === 'in_progress' ? 'text-blue-400' : 'text-zinc-500'
                        }`}>
                          {getStatusLabel(task.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border ${getPriorityColorClass(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-zinc-400 font-mono text-[10px]">
                        {task.category}
                      </td>
                      <td className="py-4 px-4 text-zinc-300 font-mono">
                        {task.estimatedHours}h
                      </td>
                      <td className="py-4 px-4 text-zinc-400 font-mono text-[10px]">
                        {task.deadline}
                      </td>
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {task.status !== 'completed' && (
                            <button 
                              onClick={() => startFocusSession(task.id)}
                              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 p-1.5 rounded-lg transition-colors cursor-pointer"
                              title="Start Focus Timer"
                            >
                              <Timer size={13} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleUpdateStatus(task.id, task.status === 'completed' ? 'todo' : 'completed')}
                            className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 p-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Check size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Calendar schedule outline views */
        <div className="space-y-4 max-w-3xl">
          <span className="font-mono text-[10px] text-zinc-500 block uppercase">CHRONOLOGICAL SPRINT PIPELINE</span>
          
          <div className="space-y-3">
            {dataSyncing && tasks.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-zinc-950/60 border border-zinc-900 p-4 rounded-xl flex items-center justify-between gap-4 animate-pulse">
                  <div className="flex items-center gap-4 w-full">
                    <div className="bg-zinc-900 rounded-lg h-12 w-16 shrink-0"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-1/3 bg-zinc-800 rounded"></div>
                      <div className="h-3 w-2/3 bg-zinc-800 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : filteredTasks.length === 0 ? (
              <div className="py-12 border border-dashed border-zinc-900/60 bg-[#050508]/50 rounded-2xl text-center text-zinc-500 font-sans">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Calendar size={20} className="text-zinc-600" />
                  <span className="text-sm font-semibold text-zinc-400">Timeline Clear</span>
                  <span className="text-[10px] max-w-xs">No upcoming chronological items map to your current filter state.</span>
                </div>
              </div>
            ) : (
              filteredTasks
                .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
                .map((task) => (
                  <div 
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="bg-zinc-950/60 border border-zinc-900 p-4 rounded-xl flex items-center justify-between gap-4 cursor-pointer hover:border-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-center shrink-0 w-16">
                        <span className="font-mono text-[10px] text-zinc-500 block uppercase leading-none">DUE</span>
                        <span className="font-mono text-sm font-bold text-zinc-200 mt-1 block leading-none">
                          {task.deadline.split('-')[2] || 'TBD'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-[8px] px-1 rounded uppercase ${getPriorityColorClass(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className="font-mono text-[9px] text-zinc-500 uppercase">{task.category}</span>
                        </div>
                        <h4 className="font-sans font-bold text-zinc-200 text-xs">{task.title}</h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className="font-mono text-[10px] text-zinc-500 mr-2">EST: {task.estimatedHours}h</span>
                      <button 
                        onClick={() => handleUpdateStatus(task.id, 'completed')}
                        className="bg-zinc-900 hover:bg-zinc-850 p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      >
                        <Check size={13} />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* TASK DETAIL POPUP DRAWER MODAL */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0a0a0f] border border-zinc-850 rounded-2xl shadow-2xl p-6 relative overflow-hidden text-left">
            {/* Window control details */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Bookmark size={14} className="text-blue-500" />
                <span className="font-mono text-[10px] text-zinc-500 uppercase">Task Identity Unit</span>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-1 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Core meta */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-mono text-[9px] uppercase px-1.5 py-0.5 rounded border ${getPriorityColorClass(selectedTask.priority)}`}>
                    {selectedTask.priority}
                  </span>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase">{selectedTask.category}</span>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase ml-auto">DUE: {selectedTask.deadline}</span>
                </div>
                <h3 className="font-sans font-bold text-zinc-100 text-sm md:text-base">{selectedTask.title}</h3>
                <p className="font-sans text-xs text-zinc-400 leading-relaxed bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-900/60">
                  {selectedTask.description}
                </p>
              </div>

              {/* Subtask interactive checklist */}
              <div className="space-y-2.5">
                <span className="font-mono text-[9px] text-zinc-500 block uppercase">INTERACTIVE CHECKPOINTS ({selectedTask.subtasks.filter(s => s.completed).length}/{selectedTask.subtasks.length})</span>
                {selectedTask.subtasks.length === 0 ? (
                  <p className="text-[11px] text-zinc-500 font-sans italic">No checklist items formulated.</p>
                ) : (
                  <div className="space-y-1.5 bg-[#050508] p-3 rounded-xl border border-zinc-900/40">
                    {selectedTask.subtasks.map((sub) => (
                      <div 
                        key={sub.id}
                        onClick={() => toggleSubtask(selectedTask.id, sub.id)}
                        className="flex items-center gap-2.5 p-1.5 hover:bg-zinc-900/40 rounded transition-colors cursor-pointer text-xs"
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          sub.completed ? 'bg-blue-600 border-blue-500 text-white' : 'border-zinc-800 bg-zinc-950'
                        }`}>
                          {sub.completed && <Check size={11} />}
                        </div>
                        <span className={sub.completed ? 'line-through text-zinc-500' : 'text-zinc-300'}>
                          {sub.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Strategy Advice block */}
              {selectedTask.executionStrategy && (
                <div className="border border-purple-500/10 bg-purple-500/5 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-purple-400 font-sans font-semibold text-xs">
                    <Cpu size={14} className="animate-pulse" />
                    <span>AI DIRECTIVE STRATEGY COMPILATION</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">{selectedTask.executionStrategy}</p>
                </div>
              )}

              {/* Action Operations panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-900 pt-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      startFocusSession(selectedTask.id, 25);
                      setSelectedTask(null);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Timer size={14} />
                    <span>Focus 25m</span>
                  </button>
                  <button 
                    onClick={() => {
                      handleUpdateStatus(selectedTask.id, selectedTask.status === 'completed' ? 'todo' : 'completed');
                    }}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs py-2 rounded-xl transition-colors font-medium flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check size={13} />
                    <span>{selectedTask.status === 'completed' ? 'Reopen' : 'Complete'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <span className="font-mono text-[9px] text-zinc-600 uppercase">COGNITIVE INDEX SECURE •</span>
                  <button 
                    onClick={() => handleDeleteTaskClick(selectedTask.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 rounded-xl transition-all cursor-pointer"
                    title="Delete Task"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW TASK MODAL */}
      {createOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0a0f] border border-zinc-850 rounded-2xl shadow-2xl p-6 relative text-left">
            <button 
              onClick={() => setCreateOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <X size={16} />
            </button>

            <h3 className="font-sans font-bold text-sm text-zinc-100 uppercase tracking-wider mb-4">Formulate Sprint Goal</h3>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-4 font-sans">
              <div>
                <label className="block font-mono text-[9px] text-zinc-500 mb-1.5 uppercase font-medium">Task Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Secure web service webhook endpoint signature validation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-mono text-[9px] text-zinc-500 mb-1.5 uppercase font-medium">Description</label>
                <textarea 
                  rows={2}
                  placeholder="Provide precise functional guidelines or instructions."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[9px] text-zinc-500 mb-1.5 uppercase font-medium">Priority</label>
                  <select 
                    value={newPriority}
                    onChange={(e: any) => setNewPriority(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[9px] text-zinc-500 mb-1.5 uppercase font-medium">Est Hours</label>
                  <input 
                    type="number" 
                    required
                    value={newEst}
                    onChange={(e) => setNewEst(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[9px] text-zinc-500 mb-1.5 uppercase font-medium">Category</label>
                  <select 
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Optimization">Optimization</option>
                    <option value="Design">UI/UX Design</option>
                    <option value="Education">Education</option>
                    <option value="Billing">Billing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[9px] text-zinc-500 mb-1.5 uppercase font-medium">Due Date</label>
                  <input 
                    type="date" 
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-sans text-xs font-semibold py-2.5 rounded-lg transition-colors mt-2"
              >
                Inject Task Nodes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
