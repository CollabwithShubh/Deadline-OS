import { 
  getTasksFromDB, 
  getSessionsFromDB, 
  getUserProfile 
} from '../dbService';
import { getDb } from '../../database/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

export interface AIContextBlock {
  user: {
    name: string;
    email: string;
    timezone: string;
    dailyGoal: number;
  };
  tasks: any[];
  focusHistory: any[];
  recentPlans: any[];
  memories: any[];
  patterns: any[];
  systemTime: string;
}

/**
 * Loads the complete state for a user and creates a rich context block for prompt injection.
 */
export async function buildAIContext(userId: string, email: string): Promise<AIContextBlock> {
  const db = getDb();
  
  // 1. Fetch User profile (fallback to default if not found)
  let userProfile = await getUserProfile(userId);
  if (!userProfile) {
    userProfile = {
      id: userId,
      name: 'Operator',
      email: email,
      avatar: '',
      tier: 'PRO',
      timezone: 'UTC-7 (Pacific Standard Time)',
      dailyGoal: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // 2. Load Tasks
  const tasks = await getTasksFromDB(userId);
  const activeTasks = tasks.filter(t => t.status !== 'completed');

  // 3. Load focus sessions
  const sessions = await getSessionsFromDB(userId);
  const recentSessions = sessions
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);

  // 4. Load memories and context patterns from firestore
  const memories: any[] = [];
  const patterns: any[] = [];
  const recentPlans: any[] = [];

  try {
    // Load recent memories
    const memQuery = query(collection(db, 'memory'), where('userId', '==', userId), limit(5));
    const memSnap = await getDocs(memQuery);
    memSnap.forEach(docSnap => memories.push(docSnap.data()));

    // Load recent patterns
    const patQuery = query(collection(db, 'user_patterns'), where('userId', '==', userId), limit(5));
    const patSnap = await getDocs(patQuery);
    patSnap.forEach(docSnap => patterns.push(docSnap.data()));
  } catch (error) {
    console.warn('[ContextEngine] Secondary collections query error (indexes might be provisioning):', error);
  }

  return {
    user: {
      name: userProfile.name,
      email: userProfile.email,
      timezone: userProfile.timezone,
      dailyGoal: userProfile.dailyGoal
    },
    tasks: activeTasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      status: t.status,
      priority: t.priority,
      deadline: t.deadline,
      estimatedHours: t.estimatedHours,
      actualHours: t.actualHours || 0,
      risk: t.risk || 'low',
      category: t.category || 'General',
      subtasksCount: t.subtasks?.length || 0,
      completedSubtasksCount: t.subtasks?.filter((s: any) => s.completed).length || 0
    })),
    focusHistory: recentSessions.map(s => ({
      taskId: s.taskId,
      duration: s.durationMinutes,
      status: s.status,
      completed: s.completed,
      createdAt: s.createdAt
    })),
    recentPlans: [],
    memories,
    patterns,
    systemTime: new Date().toISOString()
  };
}

/**
 * Turns the aggregated context block into a clear, highly structured XML/Markdown string
 * that the LLM can cleanly parse inside prompt templates.
 */
export function formatContextForPrompt(ctx: AIContextBlock): string {
  return `
[SYSTEM_CLOCK]
Current ISO Timestamp: ${ctx.systemTime}

[USER_PROFILE]
Name: ${ctx.user.name}
Email: ${ctx.user.email}
Timezone: ${ctx.user.timezone}
Daily Target hours: ${ctx.user.dailyGoal}

[ACTIVE_BACKLOG_TASKS]
${ctx.tasks.length === 0 ? "No active tasks in system queue." : JSON.stringify(ctx.tasks, null, 2)}

[RECENT_EXECUTION_HISTORY]
${ctx.focusHistory.length === 0 ? "No focus session logs registered yet." : JSON.stringify(ctx.focusHistory, null, 2)}

[USER_PERSISTENT_MEMORIES]
${ctx.memories.length === 0 ? "No prior learning structures persisted yet." : JSON.stringify(ctx.memories.map(m => m.concept), null, 2)}

[USER_COGNITIVE_PATTERNS]
${ctx.patterns.length === 0 ? "No behavior patterns recorded yet." : JSON.stringify(ctx.patterns, null, 2)}
`;
}
