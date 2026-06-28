import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { auth } from '../lib/firebase';
import { Task, Plan, AIMessage, FocusSession, UserProfile, RescuePlan, AppState } from '../types';

interface AppContextProps extends AppState {
  setCurrentPage: (page: string) => void;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  generatePlan: (prompt: string) => Promise<void>;
  approvePlan: (planId: string) => void;
  startFocusSession: (taskId?: string, durationMinutes?: number) => void;
  pauseFocusSession: () => void;
  resumeFocusSession: () => void;
  resetFocusSession: () => void;
  stopFocusSession: (completed?: boolean) => void;
  triggerRescueMode: (input: string) => void;
  clearRescueMode: () => void;
  sendAIMessage: (text: string) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  setSearchQuery: (query: string) => void;
  setSidebarOpen: (open: boolean) => void;
  setAssistantOpen: (open: boolean) => void;
  setFullscreenFocus: (fullscreen: boolean) => void;
  setFocusSoundType: (sound: FocusSession['soundType']) => void;
  quickAddTask: (prompt: string) => Promise<any>;
  triggerDemoMode: () => Promise<void>;
  notificationPermission: string;
  requestNotificationPermission: () => Promise<boolean>;
  sendDesktopNotification: (title: string, options?: any) => void;
  aiPersonality: 'professional' | 'friendly' | 'motivational' | 'roast';
  setAiPersonality: (personality: 'professional' | 'friendly' | 'motivational' | 'roast') => void;
  apiFetch: (url: string, options?: RequestInit) => Promise<any>;
  syncData: () => Promise<void>;
  authInitialized: boolean;
  dataSyncing: boolean;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

let isProcessingQueue = false;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPageState] = useState<string>('landing');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [aiMessages, setAIMessages] = useState<AIMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "Welcome back, Operator. System initialized. Type '/plan' or check the Planner page to compile optimized roadmaps.",
      timestamp: '08:00 AM'
    }
  ]);
  
  const [focusSession, setFocusSession] = useState<FocusSession>({
    isActive: false,
    timeLeft: 1500,
    duration: 1500,
    isPaused: false,
    soundType: 'none',
    completedSessions: 0,
    totalFocusTime: 0
  });

  const [rescuePlan, setRescuePlan] = useState<RescuePlan | null>(null);
  const [productivityScore, setProductivityScore] = useState<number>(75);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [assistantOpen, setAssistantOpen] = useState<boolean>(false);
  const [fullscreenFocus, setFullscreenFocus] = useState<boolean>(false);
  
  const [aiPersonality, setAiPersonalityState] = useState<'professional' | 'friendly' | 'motivational' | 'roast'>('professional');

  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  const [user, setUser] = useState<UserProfile | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Use Firebase Auth to restore session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
      if (firebaseUser) {
        // Authenticate with backend and fetch full profile
        try {
          const email = firebaseUser.email || `${firebaseUser.uid}@demo.local`;
          const name = firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Demo Operator');
          
          const res = await fetch('/api/auth/oauth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: email,
              name: name,
              avatar: firebaseUser.photoURL,
              uid: firebaseUser.uid
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            localStorage.removeItem('demo_uid');
            localStorage.removeItem('deadlineos_sync_queue');
            setTasks([]);
            setPlans([]);
            setNotifications([]);
            setAIMessages([{
              id: 'msg-1',
              sender: 'ai',
              text: "Welcome back, Operator. System initialized. Type '/plan' or check the Planner page to compile optimized roadmaps.",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            
            setUser({
              uid: data.user.id,
              name: data.user.name,
              email: data.user.email,
              avatar: data.user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.user.name}`,
              tier: data.user.tier || 'PRO',
              timezone: data.user.timezone || 'UTC-7 (Pacific Standard Time)',
              dailyGoal: data.user.dailyGoal || 6,
              aiPersonality: data.user.aiPersonality || 'professional',
              completedSessions: data.user.completedSessions || 0,
              totalFocusTime: data.user.totalFocusTime || 0
            });
            
            // Restore Focus Session and AI Personality state
            if (data.user.aiPersonality) setAiPersonalityState(data.user.aiPersonality);
            setFocusSession(prev => ({
               ...prev,
               completedSessions: data.user.completedSessions || 0,
               totalFocusTime: data.user.totalFocusTime || 0
            }));
            
            // Re-route from landing or auth to dashboard
            if (window.location.hash === '' || window.location.hash === '#landing' || window.location.hash === '#auth') {
              setCurrentPageState('dashboard');
              window.location.hash = 'dashboard';
            }
          }
        } catch (err) {
          console.error("Failed to restore session", err);
        }
      } else {
        const fallbackUid = localStorage.getItem('demo_uid');
        if (fallbackUid) {
          setUser({
            uid: fallbackUid,
            email: `${fallbackUid}@demo.local`,
            name: 'Demo Operator',
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=DemoUser`,
            tier: 'PRO',
            timezone: 'UTC',
            dailyGoal: 6,
            aiPersonality: 'professional',
            completedSessions: 0,
            totalFocusTime: 0
          });
        } else {
          setUser(null);
        }
        // If we are intentionally on dashboard (e.g., demo mode), don't force back to landing
        setCurrentPageState(prev => prev === 'dashboard' ? 'dashboard' : 'landing');
      }
      setAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  // Background Sync Queue
  const processSyncQueue = async () => {
    if (typeof window === 'undefined') return;
    if (isProcessingQueue) return;
    
    const queueStr = localStorage.getItem('deadlineos_sync_queue');
    if (!queueStr) return;
    const queue = JSON.parse(queueStr);
    if (!queue || queue.length === 0) return;
    
    isProcessingQueue = true;
    
    try {
      const remaining = [];
      for (const req of queue) {
        try {
          const safeUid = String(user?.uid || '').replace(/[^\x20-\x7E]/g, '').trim();
          const safeEmail = String(user?.email || '').replace(/[^\x20-\x7E]/g, '').trim();
          const headers = {
            'Content-Type': 'application/json',
            'x-user-uid': safeUid,
            'x-user-email': safeEmail,
            ...(req.options.headers || {})
          };
          const res = await fetch(req.url, { ...req.options, headers });
          if (!res.ok) {
             if (res.status >= 500) {
               remaining.push(req); // keep on server error
             }
          }
        } catch (err) {
          remaining.push(req); // keep on network error
        }
      }
      localStorage.setItem('deadlineos_sync_queue', JSON.stringify(remaining));
    } finally {
      isProcessingQueue = false;
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      processSyncQueue();
      syncData(); // also re-sync state
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [user]);

  // Dynamic fetch helper with user isolation header
  const apiFetch = async (url: string, options: RequestInit = {}) => {
    let fallbackUid = localStorage.getItem('demo_uid');
    if (!fallbackUid) {
      fallbackUid = 'demo_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('demo_uid', fallbackUid);
    }

    const safeUid = String(user?.uid || fallbackUid).replace(/[^\x20-\x7E]/g, '').trim();
    const safeEmail = String(user?.email || `${fallbackUid}@demo.local`).replace(/[^\x20-\x7E]/g, '').trim();

    const headers = {
      'Content-Type': 'application/json',
      'x-user-uid': safeUid,
      'x-user-email': safeEmail,
      ...(options.headers || {})
    };
    try {
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (error: any) {
      // If network error and it's a mutation, queue it
      if (options.method && ['POST', 'PUT', 'DELETE'].includes(options.method.toUpperCase())) {
        if (!url.includes('/api/demo/seed') && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
           const queue = JSON.parse(localStorage.getItem('deadlineos_sync_queue') || '[]');
           queue.push({ url, options });
           localStorage.setItem('deadlineos_sync_queue', JSON.stringify(queue));
           console.warn('Network unavailable. Operation queued for background sync.');
           // We throw an optimistic fake response or throw so the caller handles it?
           // The prompt says: "Automatically synchronize them once connectivity is restored. Prevent duplicate writes. Prevent conflicting updates."
           
            const parsedBody = options.body ? JSON.parse(options.body as string) : {};
            let returnObj: any = { success: true, queued: true, msg: "Queued for sync" };
            if (url.includes('/api/tasks')) {
               returnObj.task = { id: 'temp-' + Date.now(), ...parsedBody, createdAt: new Date().toISOString() };
            } else if (url.includes('/api/messages')) {
               returnObj.message = { dbId: 'temp-' + Date.now(), ...parsedBody, createdAt: new Date().toISOString() };
            } else if (url.includes('/api/plan')) {
               returnObj.plan = { id: 'temp-' + Date.now(), ...parsedBody, createdAt: new Date().toISOString(), tasks: [] };
            }
            return returnObj; 
        }
      }
      throw error;
    }
  };

  // Removed localStorage sync for user to rely on Firestore

  const [dataSyncing, setDataSyncing] = useState(false);

  
  // Load Initial User Data from API (Legacy manual call is now a no-op since we use listeners)
  const syncData = async () => {};

  // Real-time Firestore Listeners
  useEffect(() => {
    if (!user?.uid) return;

    setDataSyncing(true);

    const qTasks = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      const loadedTasks = (snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[]).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      
      const now = new Date();
      const overdueUpdated: Task[] = [];
      let needsRescue = false;
      
      for (const t of loadedTasks) {
        if (t.status !== 'completed' && t.status !== 'overdue') {
          const deadlineDate = new Date(t.deadline);
          deadlineDate.setHours(23, 59, 59, 999);
          if (deadlineDate < now) {
            t.status = 'overdue';
            overdueUpdated.push(t);
            needsRescue = true;
          }
        }
      }
      
      setTasks(loadedTasks);
      setDataSyncing(false);

      if (overdueUpdated.length > 0) {
        overdueUpdated.forEach(t => {
          apiFetch(`/api/tasks/${t.id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: 'overdue' })
          }).catch(() => {});
        });
        
        // Prevent duplicate rescue generation by checking sessionStorage
        if (needsRescue) {
           const lastRescue = sessionStorage.getItem('last_auto_rescue');
           if (!lastRescue || (Date.now() - parseInt(lastRescue) > 24 * 60 * 60 * 1000)) {
              sessionStorage.setItem('last_auto_rescue', Date.now().toString());
              triggerRescueMode("Missed deadlines detected during inactivity. Requesting urgent recovery matrix.");
           }
        }
      }
    });

    const qPlans = query(collection(db, 'plans'), where('userId', '==', user.uid));
    const unsubPlans = onSnapshot(qPlans, (snapshot) => {
      setPlans((snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Plan[]).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')));
    });

    const qNotifs = query(collection(db, 'notifications'), where('userId', '==', user.uid), limit(100));
    const unsubNotifs = onSnapshot(qNotifs, (snapshot) => {
      setNotifications((snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))).sort((a: any, b: any) => (b.createdAt || b.time || '').localeCompare(a.createdAt || a.time || '')));
    });

    const qMsgs = query(collection(db, 'messages'), where('userId', '==', user.uid), limit(200));
    const unsubMsgs = onSnapshot(qMsgs, (snapshot) => {
      setAIMessages((snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AIMessage[]).sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || '')));
    });

    // We no longer strictly need the dashboard fetch since metrics are computed locally, 
    // but if backend did something special we'd keep it. Locally computed is faster.


    const docUser = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(docUser, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUser(prev => prev ? {
          ...prev,
          completedSessions: data.completedSessions ?? prev.completedSessions,
          totalFocusTime: data.totalFocusTime ?? prev.totalFocusTime,
          aiPersonality: data.aiPersonality ?? prev.aiPersonality,
        } : null);
        if (data.aiPersonality) setAiPersonalityState(data.aiPersonality);
        setFocusSession(prev => ({
           ...prev,
           completedSessions: data.completedSessions ?? prev.completedSessions,
           totalFocusTime: data.totalFocusTime ?? prev.totalFocusTime
        }));
      }
    });

    return () => {
      unsubTasks();
      unsubPlans();
      unsubNotifs();
      unsubMsgs();
      unsubUser();
    };
  }, [user?.uid]);


  // Recalculate metrics locally when tasks update
  useEffect(() => {
    if (tasks.length === 0) {
      setProductivityScore(0);
      return;
    }
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => t.status === 'overdue').length;
    const score = Math.round((completed / tasks.length) * 100 - (overdue * 8));
    setProductivityScore(Math.max(0, Math.min(100, score)));
  }, [tasks]);

  // Focus Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (focusSession.isActive && !focusSession.isPaused) {
      interval = setInterval(() => {
        setFocusSession(prev => {
          if (prev.timeLeft <= 1) {
            if (interval) clearInterval(interval);
            
            // Log completed session on backend
            const addedMinutes = Math.round(prev.duration / 60);
            apiFetch('/api/execution/complete', {
              method: 'POST',
              body: JSON.stringify({
                taskId: prev.taskId,
                durationMinutes: addedMinutes,
                completed: true
              })
            }).then(() => {
              if (user) {
                updateProfile({
                  completedSessions: (user.completedSessions || 0) + 1,
                  totalFocusTime: (user.totalFocusTime || 0) + addedMinutes
                });
              }
              syncData();
            });

            sendDesktopNotification('Focus Session Completed! ⏱️', {
              body: 'Outstanding focus! Your timer has run out. Take a well-deserved break.'
            });

            return {
              ...prev,
              isActive: false,
              timeLeft: 0,
              completedSessions: prev.completedSessions + 1,
              totalFocusTime: prev.totalFocusTime + Math.round(prev.duration / 60)
            };
          }
          return {
            ...prev,
            timeLeft: prev.timeLeft - 1
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusSession.isActive, focusSession.isPaused, focusSession.duration]);

  // Routing Handler
  const setCurrentPage = (page: string) => {
    setCurrentPageState(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page !== 'execution') {
      setFullscreenFocus(false);
    }
  };

  // Sync hash state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validPages = ['landing', 'auth', 'dashboard', 'planner', 'tasks', 'execution', 'analytics', 'settings', 'profile'];
      if (hash && validPages.includes(hash)) {
        setCurrentPageState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const addTask = async (taskInput: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const res = await apiFetch('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskInput)
      });
      if (res.success) {
        setTasks(prev => [res.task, ...prev]);
        syncData();
        if (res.task.priority === 'critical') {
          sendDesktopNotification('Urgent Attention Required ⚠️', {
            body: `Critical task added: "${res.task.title}". Immediate focus recommended.`
          });
        }
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (updatedTask: Task) => {
    try {
      const oldTask = tasks.find(t => t.id === updatedTask.id);
      const res = await apiFetch(`/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedTask)
      });
      if (res.success) {
        setTasks(prev => prev.map(t => (t.id === updatedTask.id ? { ...t, ...res.task } : t)));
        syncData();
        
        if (oldTask) {
          if (oldTask.status !== 'completed' && updatedTask.status === 'completed') {
            sendDesktopNotification('Task Completed! 🎉', {
              body: `"${updatedTask.title}" has been successfully completed. Great job!`
            });
          } else if (oldTask.priority !== 'critical' && updatedTask.priority === 'critical') {
            sendDesktopNotification('Urgent Attention Required ⚠️', {
              body: `"${updatedTask.title}" has been elevated to CRITICAL. Immediate focus recommended.`
            });
          }
        }
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const res = await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.success) {
        setTasks(prev => prev.filter(t => t.id !== id));
        syncData();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    const updatedSubtasks = targetTask.subtasks.map(s => {
      if (s.id === subtaskId) {
        return { ...s, completed: !s.completed };
      }
      return s;
    });

    await updateTask({ ...targetTask, subtasks: updatedSubtasks });
  };

  const generatePlan = async (prompt: string) => {
    // Append user message instantly
    const userMsg: AIMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAIMessages(prev => [...prev, userMsg]);
    
    // Add pending state
    const typingId = `msg-${Date.now()}-t`;
    setAIMessages(prev => [...prev, {
      id: typingId,
      sender: 'ai',
      text: "Securing connection... Orchestrating Gemini compilation engine to blueprint milestone roadmaps...",
      timestamp: 'Just now'
    }]);

    try {
      const res = await apiFetch('/api/plan', {
        method: 'POST',
        body: JSON.stringify({ prompt })
      });

      if (res.success) {
        setPlans(prev => [res.plan, ...prev]);
        sendDesktopNotification('Schedule Optimized by AI 🧠', {
          body: `A new execution roadmap has been mathematically compiled and optimized.`
        });
        setAIMessages(prev => prev.map(m => m.id === typingId ? {
          id: typingId,
          sender: 'ai',
          text: `Optimized plan compiled successfully. Forwarding directives to the Planner dashboard.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'suggest_plan',
          meta: { planId: res.plan.id }
        } : m));
        syncData();
      }
    } catch (error: any) {
      console.error('AI compilation failure:', error);
      setAIMessages(prev => prev.map(m => m.id === typingId ? {
        id: typingId,
        sender: 'ai',
        text: `The compilation service is currently unavailable. Please attempt to dispatch your request again in a few moments.`,
        timestamp: 'Just now'
      } : m));
      throw error;
    }
  };

  const approvePlan = async (planId: string) => {
    const targetPlan = plans.find(p => p.id === planId);
    if (!targetPlan) return;

    try {
      // Approve on backend
      await apiFetch(`/api/plans/${planId}`, {
        method: 'PUT',
        body: JSON.stringify({ isApproved: true })
      });

      // Inject tasks to DB
      for (const t of targetPlan.tasks) {
        await addTask({
          title: t.title,
          description: t.description,
          status: 'todo',
          priority: t.priority,
          deadline: t.deadline,
          estimatedHours: t.estimatedHours,
          actualHours: 0,
          subtasks: t.subtasks || [],
          tags: t.tags || [],
          risk: t.risk || 'low',
          category: t.category || 'General',
          executionStrategy: t.executionStrategy || ''
        });
      }

      setPlans(prev => prev.map(p => p.id === planId ? { ...p, isApproved: true } : p));
      syncData();
    } catch (error) {
      console.error('Error approving AI plan:', error);
    }
  };

  const startFocusSession = async (taskId?: string, durationMinutes = 25) => {
    try {
      await apiFetch('/api/execution/start', {
        method: 'POST',
        body: JSON.stringify({ taskId, durationMinutes })
      });

      setFocusSession(prev => ({
        ...prev,
        isActive: true,
        timeLeft: durationMinutes * 60,
        duration: durationMinutes * 60,
        isPaused: false,
        taskId: taskId
      }));
      
      setCurrentPage('execution');
    } catch (error) {
      console.error('Error starting focus session:', error);
    }
  };

  const pauseFocusSession = () => {
    setFocusSession(prev => ({ ...prev, isPaused: true }));
  };

  const resumeFocusSession = () => {
    setFocusSession(prev => ({ ...prev, isPaused: false }));
  };

  const resetFocusSession = () => {
    setFocusSession(prev => ({
      ...prev,
      timeLeft: prev.duration,
      isPaused: true
    }));
  };

  const stopFocusSession = async (completed = false) => {
    try {
      await apiFetch('/api/execution/complete', {
        method: 'POST',
        body: JSON.stringify({
          taskId: focusSession.taskId,
          durationMinutes: Math.round((focusSession.duration - focusSession.timeLeft) / 60),
          completed
        })
      });

      setFocusSession(prev => ({
        ...prev,
        isActive: false,
        timeLeft: prev.duration,
        isPaused: false,
        completedSessions: completed ? prev.completedSessions + 1 : prev.completedSessions,
        totalFocusTime: completed ? prev.totalFocusTime + Math.round(prev.duration / 60) : prev.totalFocusTime
      }));

      syncData();
    } catch (error) {
      console.error('Error stopping focus session:', error);
    }
  };

  const setFocusSoundType = (sound: FocusSession['soundType']) => {
    setFocusSession(prev => ({ ...prev, soundType: sound }));
  };

  const triggerRescueMode = async (input: string) => {
    try {
      const res = await apiFetch('/api/recovery', {
        method: 'POST',
        body: JSON.stringify({ input })
      });

      if (res.success) {
        const rescueData = res.rescuePlan;
        
        // Match response actions back to live tasks
        const actionsWithTasks = rescueData.actions.map((act: any) => {
          const matchedTask = tasks.find(t => t.id === act.taskId) || tasks[0];
          return {
            type: act.type,
            task: matchedTask,
            actionDescription: act.actionDescription
          };
        }).filter((act: any) => act.task !== undefined);

        setRescuePlan({
          originalScore: productivityScore,
          recoveryScore: rescueData.recoveryScore,
          actions: actionsWithTasks,
          recoveryTimeline: rescueData.recoveryTimeline
        });

        setAIMessages(prev => [
          ...prev,
          {
            id: `msg-${Date.now()}-u-rescue`,
            sender: 'user',
            text: `[EMERGENCY_RESCUE]: ${input}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            id: `msg-${Date.now()}-ai-rescue`,
            sender: 'ai',
            text: `Emergency protocol active. Restructuring timeline matrix to recover ${rescueData.recoveryScore - productivityScore}% productivity rating. Details piped to dashboard workspace.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'rescue'
          }
        ]);

        syncData();
        setCurrentPage('dashboard');
      }
    } catch (error) {
      console.error('Failed to compile rescue layout:', error);
      setAIMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-ai-error`,
          sender: 'ai',
          text: `Rescue protocol generation is currently unavailable. Please focus on your highest priority task manually for now.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const clearRescueMode = () => {
    setRescuePlan(null);
  };

  const sendAIMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Omit<AIMessage, 'id'> = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    // Store user message
    try {
      const resMsg = await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify(userMsg)
      });
      setAIMessages(prev => [...prev, { ...userMsg, id: resMsg.message.dbId } as AIMessage]);
    } catch (err) {
      setAIMessages(prev => [...prev, { ...userMsg, id: `msg-${Date.now()}-u` } as AIMessage]);
    }

    // Simple reactive chat responses for direct user queries
    setTimeout(async () => {
      let aiText = "Operator signal recognized. Directing coordinates... Use /plan to structure subtask schedules.";
      let type: AIMessage['type'] = 'default';

      const lowTxt = text.toLowerCase();
      if (lowTxt.includes('help') || lowTxt.includes('hello')) {
        aiText = "Awaiting command parameters. I am authorized to generate project plans, triage overloaded backlogs, and sync active focus sessions.";
      } else if (lowTxt.includes('status') || lowTxt.includes('how am i')) {
        const overdueCount = tasks.filter(t => t.status === 'overdue').length;
        aiText = `System diagnostics: Compliance rate currently sitting at ${productivityScore}%. Backlog overhead is: ${overdueCount} overdue vectors. Let's target "${tasks[0]?.title || 'Next Sprint Task'}" to stabilize velocity.`;
      } else if (lowTxt.includes('wasted') || lowTxt.includes('stuck') || lowTxt.includes('rescue')) {
        aiText = "Warning: Backlog accumulation detected. Instantly fire up [Rescue Mode] from your Dashboard to clean non-critical drag.";
        type = 'alert';
      }

      const aiMsg: Omit<AIMessage, 'id'> = {
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type
      };
      
      try {
        const resAi = await apiFetch('/api/messages', {
          method: 'POST',
          body: JSON.stringify(aiMsg)
        });
        setAIMessages(prev => [...prev, { ...aiMsg, id: resAi.message.dbId } as AIMessage]);
      } catch (err) {
        setAIMessages(prev => [...prev, { ...aiMsg, id: `msg-${Date.now()}-ai` } as AIMessage]);
      }
    }, 700);
  };

  const dismissNotification = async (id: string) => {
    try {
      await apiFetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    for (const n of notifications) {
      await dismissNotification(n.id);
    }
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const updatedUser = { ...user, ...updated };
      setUser(updatedUser);
      
      // Update on backend
      await apiFetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify(updated)
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const setAiPersonality = (p: 'professional' | 'friendly' | 'motivational' | 'roast') => {
    setAiPersonalityState(p);
    if (user) {
      updateProfile({ aiPersonality: p });
    }
  };

  const quickAddTask = async (prompt: string) => {
    try {
      const res = await apiFetch('/api/tasks/quick-add', {
        method: 'POST',
        body: JSON.stringify({ prompt })
      });
      if (res.success && res.task) {
        setTasks(prev => [res.task, ...prev]);
        syncData();
        return res.task;
      }
    } catch (error) {
      console.error('Error adding quick task:', error);
    }
    return null;
  };

  const triggerDemoMode = async () => {
    try {
      // Sign out any active user to ensure we enter a clean demo mode
      if (user) {
        await signOut(auth);
      }

      // Force a new demo session so no previous account/demo data is reused
      const freshDemoUid = ('demo_' + Math.random().toString(36).substring(2, 15)).replace(/[\r\n]/g, '').trim();
      localStorage.setItem('demo_uid', freshDemoUid);

      setUser({
        uid: freshDemoUid,
        email: `${freshDemoUid}@demo.local`,
        name: 'Demo Operator',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=DemoUser`,
        tier: 'PRO',
        timezone: 'UTC',
        dailyGoal: 6,
        aiPersonality: 'professional',
        completedSessions: 0,
        totalFocusTime: 0
      });

      // Pass the new uid in headers to ensure apiFetch uses it even if setUser hasn't finished
      const res = await apiFetch('/api/demo/seed', {
        method: 'POST',
        headers: {
          'x-user-uid': freshDemoUid,
          'x-user-email': `${freshDemoUid}@demo.local`
        }
      });
      if (res.success) {
        // setCurrentPage is handled in onAuthStateChanged if they are on landing
        // but let's force it if we want
        setCurrentPageState('dashboard');
        window.location.hash = 'dashboard';
      }
    } catch (error) {
      console.error('Error seeding demo data:', error);
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationPermission('denied');
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const sendDesktopNotification = (title: string, options?: any) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/favicon.ico',
          ...options
        });
      } catch (error) {
        console.error('Error triggering desktop notification:', error);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        user,
        tasks,
        plans,
        aiMessages,
        focusSession,
        rescuePlan,
        productivityScore,
        notifications,
        searchQuery,
        sidebarOpen,
        assistantOpen,
        fullscreenFocus,
        setCurrentPage,
        addTask,
        updateTask,
        deleteTask,
        toggleSubtask,
        generatePlan,
        approvePlan,
        startFocusSession,
        pauseFocusSession,
        resumeFocusSession,
        resetFocusSession,
        stopFocusSession,
        triggerRescueMode,
        clearRescueMode,
        sendAIMessage,
        dismissNotification,
        clearAllNotifications,
        updateProfile,
        setSearchQuery,
        setSidebarOpen,
        setAssistantOpen,
        setFullscreenFocus,
        setFocusSoundType,
        quickAddTask,
        triggerDemoMode,
        notificationPermission,
        requestNotificationPermission,
        sendDesktopNotification,
        aiPersonality,
        setAiPersonality,
        apiFetch,
        syncData,
        authInitialized,
        dataSyncing
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
