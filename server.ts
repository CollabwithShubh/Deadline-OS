import { processBackgroundAutomations } from './src/backend/services/cronService';
import express from 'express';
import { sendWelcomeEmail } from './src/backend/utils/email';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { getDb } from './src/backend/database/firebase';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { 
  getUserProfile, 
  createUserProfile, 
  getTasksFromDB, 
  createTaskInDB, 
  updateTaskInDB, 
  deleteTaskFromDB, 
  createPlanInDB, 
  getPlansFromDB, 
  updatePlanInDB, 
  createSessionInDB, 
  getSessionsFromDB, 
  getNotificationsFromDB, 
  createNotificationInDB, 
  deleteNotificationFromDB,
  getMessagesFromDB,
  createMessageInDB,
  executeBatch,
  BatchOperation
} from './src/backend/services/dbService';
import { aiOrchestrator } from './src/backend/services/ai/orchestrator';
import { buildAIContext } from './src/backend/services/ai/contextEngine';
import {
  getDecisionEngineSuggestion,
  getDeadlineSimulatorScenarios,
  getAIExplanation,
  getAIProductivityDiagnostics,
  getBurnoutReport,
  getSmartReschedule,
  getScenarioComparison
} from './src/backend/services/ai/intelligentServices';
import { 
  registerSchema, 
  loginSchema, 
  taskSchema, 
  planRequestSchema, 
  recoveryRequestSchema, 
  executionStartSchema, 
  executionCompleteSchema 
} from './src/backend/validators';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// User Isolation Middleware via header
app.use((req: any, res: any, next: any) => {
  const userUid = req.headers['x-user-uid'];
  const userEmail = req.headers['x-user-email'];
  
  if (userUid) {
    req.userId = userUid;
    req.userEmail = userEmail || `${userUid}@demo.local`;
  } else {
    const fallbackEmail = userEmail || 'operator@deadlineos.ai';
    req.userEmail = (fallbackEmail as string).toLowerCase().trim();
    req.userId = req.userEmail.replace(/[^a-z0-9]/g, '_');
  }
  next();
});

// Warmup DB connection on boot
try {
  getDb();
} catch (err) {
  console.error("Warning: DB warmup failed, check credentials on boot.");
}

// ==========================================
// API ROUTES
// ==========================================

// Auth Endpoints
app.put('/api/users/me', async (req: any, res: any) => {
  try {
    const { name, email, timezone, tier, dailyGoal, aiPersonality, completedSessions, totalFocusTime, avatar } = req.body;
    const db = getDb();
    const docRef = doc(db, 'users', req.userId);
    const updates: any = { updatedAt: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (timezone !== undefined) updates.timezone = timezone;
    if (tier !== undefined) updates.tier = tier;
    if (dailyGoal !== undefined) updates.dailyGoal = dailyGoal;
    if (aiPersonality !== undefined) updates.aiPersonality = aiPersonality;
    if (completedSessions !== undefined) updates.completedSessions = completedSessions;
    if (totalFocusTime !== undefined) updates.totalFocusTime = totalFocusTime;
    if (avatar !== undefined) updates.avatar = avatar;
    
    await setDoc(docRef, updates, { merge: true });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/login', async (req: any, res: any) => {
  try {
    const data = loginSchema.parse(req.body);
    let user = await getUserProfile(req.userId);
    if (!user) {
      // Auto-register on login to maximize seamless onboarding experience
      user = await createUserProfile(req.userId, data.email, data.email.split('@')[0]);
    }
    res.json({ success: true, user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || error });
  }
});

app.post('/api/auth/oauth', async (req: any, res: any) => {
  try {
    const { email, name, avatar, uid } = req.body;
    let user = await getUserProfile(uid); 
    
    if (!user) {
      // Register user (using uid)
      user = await createUserProfile(uid, email, name || email.split('@')[0], avatar);
    }
    
    // Always send welcome email for testing
    try {
      await sendWelcomeEmail(email, name || email.split('@')[0]);
    } catch (e) {
      console.warn("Failed to send welcome email (likely demo account or missing keys), continuing...", e);
    }
    
    // If the user already has an avatar in the DB, prefer it. If not, use the oauth one.
    // Since createUserProfile sets a default unsplash avatar, we'll just check if it's the default unsplash one.
    const isDefaultAvatar = user.avatar === 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop';
    const finalAvatar = (isDefaultAvatar && avatar) ? avatar : user.avatar;
    
    res.json({ success: true, user: { ...user, avatar: finalAvatar, id: user.id } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || error });
  }
});

// Task Endpoints
app.get('/api/tasks', async (req: any, res: any) => {
  try {
    const tasks = await getTasksFromDB(req.userId);
    res.json({ success: true, tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/tasks', async (req: any, res: any) => {
  try {
    const data = taskSchema.parse(req.body);
    
    const ops: BatchOperation[] = [];
    
    // Auto-calculate risk if not provided or perform simple AI prioritization logic
    const urgentKeywords = ['now', 'today', 'asap', 'stripe', 'critical', 'production'];
    const isUrgent = urgentKeywords.some(kw => data.title.toLowerCase().includes(kw) || data.description.toLowerCase().includes(kw));
    if (isUrgent) {
      data.priority = 'critical';
      data.risk = 'high';
    }

    const newTaskData = {
      userId: req.userId,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const outTask = { id: '' };
    ops.push({ type: 'add', collection: 'tasks', data: newTaskData, outId: outTask });
    
    // Add real system notification on critical tasks
    if (data.priority === 'critical' || data.priority === 'high') {
      ops.push({
        type: 'add',
        collection: 'notifications',
        data: {
          userId: req.userId,
          title: 'Critical Focus Locked',
          desc: `High priority vector added: "${data.title}". AI schedule compilation triggered.`,
          type: 'warning',
          read: false,
          time: 'Just now',
          createdAt: new Date().toISOString()
        }
      });
    }

    await executeBatch(ops);
    const task = { id: outTask.id, ...newTaskData };

    res.json({ success: true, task });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || error });
  }
});

app.post('/api/tasks/quick-add', async (req: any, res: any) => {
  try {
    const { prompt } = req.body;
    const result = await aiOrchestrator({
      userId: req.userId,
      email: req.userEmail,
      requestType: 'quick-add',
      payload: { prompt }
    });
    
    if (result.success && result.task) {
      const task = await createTaskInDB(req.userId, {
        title: result.task.title,
        description: result.task.description || '',
        status: 'todo',
        priority: result.task.priority || 'medium',
        deadline: result.task.deadline || new Date().toISOString().split('T')[0],
        estimatedHours: result.task.estimatedHours || 1,
        actualHours: 0,
        subtasks: result.task.subtasks || [],
        tags: result.task.tags || [],
        risk: result.task.risk || 'low',
        category: result.task.category || 'General',
        executionStrategy: result.task.executionStrategy || ''
      });
      res.json({ success: true, task });
    } else {
      res.status(500).json({ success: false, error: 'AI parsing failed' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || error });
  }
});

app.put('/api/tasks/:id', async (req: any, res: any) => {
  try {
    const data = taskSchema.partial().parse(req.body);
    const updated = await updateTaskInDB(req.userId, req.params.id, data);
    res.json({ success: true, task: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || error });
  }
});

app.delete('/api/tasks/:id', async (req: any, res: any) => {
  try {
    await deleteTaskFromDB(req.userId, req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Planner Endpoints
app.get('/api/plans', async (req: any, res: any) => {
  try {
    const plans = await getPlansFromDB(req.userId);
    res.json({ success: true, plans });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/plan', async (req: any, res: any) => {
  try {
    const { prompt } = planRequestSchema.parse(req.body);
    const result = await aiOrchestrator({
      userId: req.userId,
      email: req.userEmail,
      requestType: 'plan',
      payload: { prompt }
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || error });
  }
});

app.put('/api/plans/:id', async (req: any, res: any) => {
  try {
    const updated = await updatePlanInDB(req.userId, req.params.id, req.body);
    res.json({ success: true, plan: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Emergency Recovery Endpoints
app.post('/api/recovery', async (req: any, res: any) => {
  try {
    const { input } = recoveryRequestSchema.parse(req.body);
    const result = await aiOrchestrator({
      userId: req.userId,
      email: req.userEmail,
      requestType: 'recovery',
      payload: { input }
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || error });
  }
});

// Premium Focus Directives Endpoint
app.post('/api/ai/execution', async (req: any, res: any) => {
  try {
    const { taskId } = req.body;
    const result = await aiOrchestrator({
      userId: req.userId,
      email: req.userEmail,
      requestType: 'execution',
      payload: { taskId }
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Premium AI Analytics & Reflection report
app.get('/api/ai/analytics', async (req: any, res: any) => {
  try {
    const result = await aiOrchestrator({
      userId: req.userId,
      email: req.userEmail,
      requestType: 'analytics',
      payload: {}
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Focus Execution Endpoints
app.post('/api/execution/start', async (req: any, res: any) => {
  try {
    const data = executionStartSchema.parse(req.body);
    
    const session = await createSessionInDB(req.userId, {
      taskId: data.taskId || null,
      durationMinutes: data.durationMinutes,
      status: 'active',
      startedAt: new Date().toISOString()
    });

    res.json({ success: true, session });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || error });
  }
});

app.post('/api/execution/complete', async (req: any, res: any) => {
  try {
    const data = executionCompleteSchema.parse(req.body);
    
    const sessionData = {
      userId: req.userId,
      taskId: data.taskId || null,
      durationMinutes: data.durationMinutes,
      status: 'completed',
      completed: data.completed,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    const ops: BatchOperation[] = [];
    const outSession = { id: '' };
    ops.push({ type: 'add', collection: 'sessions', data: sessionData, outId: outSession });

    // Update associated task actual hours if successfully completed
    if (data.taskId && data.completed) {
      const allTasks = await getTasksFromDB(req.userId);
      const targetTask = allTasks.find(t => t.id === data.taskId);
      if (targetTask) {
        const addedHours = Number((data.durationMinutes / 60).toFixed(1));
        ops.push({
          type: 'update',
          collection: 'tasks',
          id: data.taskId,
          data: { 
            actualHours: Number((targetTask.actualHours + addedHours).toFixed(1)),
            updatedAt: new Date().toISOString()
          }
        });
      }
    }

    await executeBatch(ops);
    const session = { id: outSession.id, ...sessionData };

    res.json({ success: true, session });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || error });
  }
});

// AI Messages Endpoints
app.get('/api/messages', async (req: any, res: any) => {
  try {
    const messages = await getMessagesFromDB(req.userId);
    res.json({ success: true, messages });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/messages', async (req: any, res: any) => {
  try {
    const msg = await createMessageInDB(req.userId, req.body);
    res.json({ success: true, message: msg });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Notifications Endpoints
app.get('/api/notifications', async (req: any, res: any) => {
  try {
    const notifications = await getNotificationsFromDB(req.userId);
    res.json({ success: true, notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/notifications/:id', async (req: any, res: any) => {
  try {
    await deleteNotificationFromDB(req.userId, req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Analytics Dashboard Endpoint
app.get('/api/dashboard', async (req: any, res: any) => {
  try {
    const tasks = await getTasksFromDB(req.userId);
    const notifications = await getNotificationsFromDB(req.userId);
    
    const activeTasks = tasks.filter(t => t.status !== 'completed');
    const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
    const overdueTasksCount = tasks.filter(t => t.status === 'overdue').length;
    
    // Calculate real productivity compliance score
    let score = 75;
    if (tasks.length > 0) {
      score = Math.round((completedTasksCount / tasks.length) * 100 - (overdueTasksCount * 8));
    }
    const finalScore = Math.max(10, Math.min(100, score));

    res.json({
      success: true,
      activeTasksCount: activeTasks.length,
      completedTasksCount,
      overdueTasksCount,
      productivityScore: finalScore,
      unreadNotificationsCount: notifications.filter(n => !n.read).length
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/demo/seed', async (req: any, res: any) => {
  try {
    const userId = req.userId;
    
    // Clear old data first to present a pristine showcase
    const oldTasks = await getTasksFromDB(userId);
    for (const t of oldTasks) {
      await deleteTaskFromDB(userId, t.id);
    }
    
    // 1. Seed demo tasks
    const demoTasks = [
      {
        title: "Optimize Webhook Performance & Cache Pipeline",
        description: "Configure bottom-up index keys on databases and integrate Redis caching to scale high-frequency operations.",
        status: "in_progress",
        priority: "critical",
        deadline: new Date().toISOString().split('T')[0],
        estimatedHours: 3.5,
        actualHours: 1.5,
        subtasks: [
          { title: "Define custom compound indexing structures", completed: true },
          { title: "Write distributed rate limit algorithms", completed: false },
          { title: "Run parallel query regression tests", completed: false }
        ],
        tags: ["Performance", "DB", "Stripe"],
        risk: "high",
        category: "Engineering",
        executionStrategy: "Establish single-thread query locks to measure pure raw performance delta."
      },
      {
        title: "Solve 5 LeetCode DP Hard Problems",
        description: "Deconstruct dynamic programming subproblems for interview preparation. Target sequence optimization and subset recurrence models.",
        status: "completed",
        priority: "high",
        deadline: new Date().toISOString().split('T')[0],
        estimatedHours: 4.0,
        actualHours: 4.5,
        subtasks: [
          { title: "Verify optimal substructure properties on subproblem trees", completed: true },
          { title: "Map overlapping dependencies to memoization grids", completed: true },
          { title: "Implement recursive backtracking base optimizations", completed: true }
        ],
        tags: ["Prep", "LeetCode"],
        risk: "medium",
        category: "Education",
        executionStrategy: "Draft state transition equations mathematically on scratchpad before coding."
      },
      {
        title: "Deploy Stripe Production Billing Gateways",
        description: "Complete key rotation procedures, activate cryptographic signature validation, and configure web mock secret safety protocols.",
        status: "overdue",
        priority: "critical",
        deadline: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], // 2 days ago
        estimatedHours: 2.5,
        actualHours: 0,
        subtasks: [
          { title: "Verify live webhook endpoints and keys", completed: false },
          { title: "Configure Stripe CLI local developer tunnels", completed: false }
        ],
        tags: ["Security", "Stripe", "Billing"],
        risk: "high",
        category: "Engineering",
        executionStrategy: "Strictly validate req.headers['stripe-signature'] against key buffer secrets."
      },
      {
        title: "Draft High-Fidelity UI Layout for Dark OS",
        description: "Design custom visual mockups utilizing Inter and Space Grotesk. Incorporate micro-animations and neon color hierarchies.",
        status: "completed",
        priority: "low",
        deadline: new Date(Date.now() - 86400000).toISOString().split('T')[0], // 1 day ago
        estimatedHours: 3.0,
        actualHours: 3.0,
        subtasks: [
          { title: "Establish color system and typography tracking spacing", completed: true },
          { title: "Construct responsive navigation rail drawer guides", completed: true }
        ],
        tags: ["Design", "Figma"],
        risk: "low",
        category: "Creative",
        executionStrategy: "Emphasize high contrast ratios (minimum 4.5:1) for optimal dark readability."
      },
      {
        title: "Quick Sync with Design Team",
        description: "Review typography decisions and padding standardizations.",
        status: "todo",
        priority: "medium",
        deadline: new Date().toISOString().split('T')[0],
        estimatedHours: 0.5,
        actualHours: 0,
        subtasks: [
          { title: "Align on spacing tokens", completed: false }
        ],
        tags: ["Meeting", "Design"],
        risk: "low",
        category: "Communication",
        executionStrategy: "Keep it brief, max 15 minutes."
      },
      {
        title: "Refactor State Management",
        description: "Migrate context to Zustand for improved render performance on heavy lists.",
        status: "todo",
        priority: "high",
        deadline: new Date().toISOString().split('T')[0],
        estimatedHours: 2.0,
        actualHours: 0,
        subtasks: [
          { title: "Set up store", completed: false },
          { title: "Update Dashboard bindings", completed: false }
        ],
        tags: ["Refactor", "React"],
        risk: "medium",
        category: "Engineering",
        executionStrategy: "Module by module replacement to avoid breaking changes."
      },
      {
        title: "Review Server Logs for Memory Leaks",
        description: "Analyze production APM metrics for the Node.js container memory spike.",
        status: "todo",
        priority: "critical",
        deadline: new Date().toISOString().split('T')[0],
        estimatedHours: 5.0,
        actualHours: 0,
        subtasks: [
          { title: "Download heap snapshots", completed: false },
          { title: "Analyze with Chrome DevTools", completed: false },
          { title: "Deploy patch", completed: false }
        ],
        tags: ["Ops", "Performance"],
        risk: "high",
        category: "Operations",
        executionStrategy: "Isolate the middleware handling heavy payload processing."
      },
      {
        title: "Update Project Documentation",
        description: "Add setup instructions for the new Redis caching layer.",
        status: "todo",
        priority: "low",
        deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        estimatedHours: 1.0,
        actualHours: 0,
        subtasks: [
          { title: "Document env vars", completed: false },
          { title: "Add docker-compose snippet", completed: false }
        ],
        tags: ["Docs"],
        risk: "low",
        category: "Administrative",
        executionStrategy: "Write clear, copy-pasteable examples."
      }
    ];

    for (const t of demoTasks) {
      await createTaskInDB(userId, t);
    }

    // 2. Seed completed focus sessions (for Analytics & Insights charts)
    const demoSessions = [
      { taskId: "seeded-task-1", durationMinutes: 45, status: "completed", completed: true, completedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
      { taskId: "seeded-task-1", durationMinutes: 30, status: "completed", completed: true, completedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
      { taskId: "seeded-task-2", durationMinutes: 60, status: "completed", completed: true, completedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { taskId: "seeded-task-2", durationMinutes: 60, status: "completed", completed: true, completedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { taskId: "seeded-task-2", durationMinutes: 45, status: "completed", completed: true, completedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
      { taskId: "seeded-task-4", durationMinutes: 45, status: "completed", completed: true, completedAt: new Date(Date.now() - 86400000 * 1).toISOString() },
      { taskId: "seeded-task-4", durationMinutes: 45, status: "completed", completed: true, completedAt: new Date().toISOString() }
    ];

    for (const s of demoSessions) {
      await createSessionInDB(userId, s);
    }

    // 3. Seed demo plans
    const demoPlan = {
      prompt: "Build premium billing pipeline with security signing buffers",
      summary: "Compiling robust billing integration checkpoints. Enforcing cryptographic signature validation, secret environment configuration variables, and query isolation tunnels.",
      tasks: [
        {
          title: "Audit Webhook Secret Signing variables",
          description: "Establish signature integrity verification and secure endpoint tunnels to shield transactions.",
          priority: "critical",
          deadline: new Date().toISOString().split('T')[0],
          estimatedHours: 2,
          subtasks: [
            { title: "Configure local Stripe CLI tunnel checks", completed: false },
            { title: "Sanitize logs from key leakage", completed: false }
          ],
          tags: ["Security", "Billing"],
          risk: "high",
          category: "Engineering",
          executionStrategy: "Strictly validate signatures before processing transactions."
        }
      ],
      riskAssessment: {
        level: "high",
        description: "Integration endpoints will fail if local tunnel loses stability or credentials mismatch on boot.",
        bottlenecks: ["Stripe CLI local forwarding", "Secret synchronization"]
      },
      timeline: [
        {
          phaseName: "Phase 1: Verification & Signature Auditing",
          duration: "2.0 Hours",
          tasks: ["Audit Webhook Secret Signing variables"]
        }
      ],
      isApproved: false
    };

    await createPlanInDB(userId, demoPlan);

    // 4. Seed system notifications
    await createNotificationInDB(userId, {
      title: 'Demo Mode Activated',
      desc: 'High-fidelity operational records successfully injected. System compliance ready for showcase.',
      type: 'success',
      read: false,
      time: 'Just now'
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || error });
  }
});

app.get('/api/analytics', async (req: any, res: any) => {
  try {
    const tasks = await getTasksFromDB(req.userId);
    const sessions = await getSessionsFromDB(req.userId);
    
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Focus intervals count
    const completedSessions = sessions.filter(s => s.status === 'completed').length;
    const totalFocusTime = sessions
      .filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

    // Productivity score calculation
    let score = 75;
    const overdueCount = tasks.filter(t => t.status === 'overdue').length;
    if (totalTasks > 0) {
      score = Math.round((completedTasks / totalTasks) * 100 - (overdueCount * 8));
    }
    const productivityScore = Math.max(10, Math.min(100, score));

    res.json({
      success: true,
      productivityScore,
      completedSessions,
      totalFocusTime,
      completionRate,
      completedTasks,
      totalTasks
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// INTELLECTUAL INTELLIGENCE OS CAPABILITIES
// ==========================================

app.get('/api/ai/decision-engine', async (req: any, res: any) => {
  try {
    const context = await buildAIContext(req.userId, req.user?.email || '');
    const personality = req.query.personality || 'professional';
    const suggestion = await getDecisionEngineSuggestion(context, personality);
    res.json({ success: true, ...suggestion });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ai/simulator', async (req: any, res: any) => {
  try {
    const { situation, personality } = req.body;
    const context = await buildAIContext(req.userId, '');
    const result = await getDeadlineSimulatorScenarios(context, situation, personality || 'professional');
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ai/simulator/apply', async (req: any, res: any) => {
  try {
    const { updatedTasks } = req.body;
    if (!Array.isArray(updatedTasks)) {
      return res.status(400).json({ success: false, error: 'Invalid updatedTasks payload' });
    }
    const ops: BatchOperation[] = [];
    for (const task of updatedTasks) {
      const updates = { ...task, updatedAt: new Date().toISOString() };
      delete updates.userId;
      delete updates.id;
      ops.push({ type: 'update', collection: 'tasks', id: task.id, data: updates });
    }
    ops.push({
      type: 'add',
      collection: 'notifications',
      data: {
        userId: req.userId,
        title: 'Schedule Recalibrated ⚙️',
        desc: 'Applied simulator adaptive timeline. Backlog states and deadlines updated.',
        type: 'success',
        read: false,
        time: 'Just now',
        createdAt: new Date().toISOString()
      }
    });
    
    await executeBatch(ops);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ai/explain', async (req: any, res: any) => {
  try {
    const { topic, details, personality } = req.body;
    const context = await buildAIContext(req.userId, '');
    const explanation = await getAIExplanation(context, topic, details, personality || 'professional');
    res.json({ success: true, ...explanation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/ai/diagnostics', async (req: any, res: any) => {
  try {
    const context = await buildAIContext(req.userId, req.user?.email || '');
    const personality = req.query.personality || 'professional';
    const diagnostics = await getAIProductivityDiagnostics(context, personality);
    res.json({ success: true, ...diagnostics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/ai/burnout-detector', async (req: any, res: any) => {
  try {
    const context = await buildAIContext(req.userId, req.user?.email || '');
    const personality = req.query.personality || 'professional';
    const report = await getBurnoutReport(context, personality);
    res.json({ success: true, ...report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ai/smart-meeting', async (req: any, res: any) => {
  try {
    const { title, durationHours, dateTime, type, personality } = req.body;
    const context = await buildAIContext(req.userId, '');
    const result = await getSmartReschedule(context, { title, durationHours, dateTime, type }, personality || 'professional');
    
    const ops: BatchOperation[] = [];
    if (result.updatedTasks && Array.isArray(result.updatedTasks)) {
      for (const t of result.updatedTasks) {
        const updates = { ...t, updatedAt: new Date().toISOString() };
        delete updates.userId;
        delete updates.id;
        ops.push({ type: 'update', collection: 'tasks', id: t.id, data: updates });
      }
    }
    
    ops.push({
      type: 'add',
      collection: 'notifications',
      data: {
        userId: req.userId,
        title: `Meeting Placed: ${title} 📅`,
        desc: `Injected fixed constraint of ${durationHours}h. AI automatically shifted conflicting work schedules to protect focus.`,
        type: 'info',
        read: false,
        time: 'Just now',
        createdAt: new Date().toISOString()
      }
    });
    
    await executeBatch(ops);
    
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/ai/scenario-comparison', async (req: any, res: any) => {
  try {
    const context = await buildAIContext(req.userId, req.user?.email || '');
    const personality = req.query.personality || 'professional';
    const comparison = await getScenarioComparison(context, personality);
    res.json({ success: true, ...comparison });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cron endpoint for all background automations (Invoked via Google Cloud Scheduler)
app.post('/api/cron/sync', async (req: any, res: any) => {
  try {
    // Basic security for Cloud Scheduler:
    // Cloud Scheduler can append a query parameter or header.
    // Example: ?key=SUPER_SECRET_CRON_KEY
    const cronKey = process.env.CRON_SECRET || 'dev_cron_secret_123';
    if (req.query.key !== cronKey && req.headers['x-cron-secret'] !== cronKey) {
       return res.status(401).json({ success: false, error: 'Unauthorized CRON execution' });
    }

    const result = await processBackgroundAutomations();
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// VITE INTEGRATION / SPA SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DeadlineOS backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
