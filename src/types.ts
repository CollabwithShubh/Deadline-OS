export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'overdue';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskRisk = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string; // ISO String or YYYY-MM-DD
  estimatedHours: number;
  actualHours: number;
  subtasks: SubTask[];
  tags: string[];
  risk: TaskRisk;
  category: string;
  executionStrategy?: string;
  createdAt?: string;
}

export interface Plan {
  id: string;
  prompt: string;
  summary: string;
  tasks: Task[];
  riskAssessment: {
    level: TaskRisk;
    description: string;
    bottlenecks: string[];
  };
  timeline: {
    phaseName: string;
    duration: string;
    tasks: string[];
  }[];
  isApproved: boolean;
  createdAt: string;
}

export interface AIMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  type?: 'default' | 'suggest_plan' | 'rescue' | 'alert';
  meta?: any;
}

export interface FocusSession {
  isActive: boolean;
  taskId?: string;
  timeLeft: number; // in seconds
  duration: number; // original duration in seconds
  isPaused: boolean;
  soundType: 'none' | 'white_noise' | 'rain' | 'binaural' | 'cyberpunk';
  completedSessions: number;
  totalFocusTime: number; // in minutes
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  tier: 'PRO' | 'ENTERPRISE';
  timezone: string;
  dailyGoal: number; // in hours
  aiPersonality?: 'professional' | 'friendly' | 'motivational' | 'roast';
  completedSessions?: number;
  totalFocusTime?: number;
}

export interface RescuePlan {
  originalScore: number;
  recoveryScore: number;
  actions: {
    type: 'keep' | 'move' | 'drop' | 'focus';
    task: Task;
    actionDescription: string;
    newDeadline?: string;
  }[];
  recoveryTimeline: {
    time: string;
    action: string;
  }[];
}

export interface AppState {
  currentPage: string;
  user: UserProfile | null;
  tasks: Task[];
  plans: Plan[];
  aiMessages: AIMessage[];
  focusSession: FocusSession;
  rescuePlan: RescuePlan | null;
  productivityScore: number; // 0 - 100
  notifications: { id: string; title: string; desc: string; type: 'info' | 'warning' | 'success'; read: boolean; time: string }[];
  searchQuery: string;
  sidebarOpen: boolean;
  assistantOpen: boolean;
  fullscreenFocus: boolean;
}
