import { getDb } from '../database/firebase';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';
import { getTasksFromDB, updateTaskInDB, createNotificationInDB, getNotificationsFromDB, getSessionsFromDB } from './dbService';
import { buildAIContext } from './ai/contextEngine';
import { getBurnoutReport, getAIProductivityDiagnostics } from './ai/intelligentServices';
import { aiOrchestrator } from './ai/orchestrator';

export async function processBackgroundAutomations() {
  const db = getDb();
  const usersSnap = await getDocs(collection(db, 'users'));
  
  let processedUsers = 0;
  const now = new Date();
  const todayISO = now.toISOString();
  
  // Calculate day of week (0 = Sunday, 1 = Monday) and hour
  const currentHour = now.getHours();
  const dayOfWeek = now.getDay();

  for (const userDoc of usersSnap.docs) {
    const uid = userDoc.id;
    try {
      await processUserAutomations(uid, todayISO, currentHour, dayOfWeek);
      processedUsers++;
    } catch (err) {
      console.error(`Failed to process automations for user ${uid}:`, err);
    }
  }

  return { processed: processedUsers };
}

async function processUserAutomations(uid: string, todayISO: string, currentHour: number, dayOfWeek: number) {
  const tasks = await getTasksFromDB(uid);
  const notifications = await getNotificationsFromDB(uid);
  const now = new Date();

  // 1. Overdue Task Detection & Rescue Mode Activation
  let hasNewOverdue = false;
  let overdueTasksCount = 0;
  
  for (const task of tasks) {
    if (task.status !== 'completed' && task.status !== 'overdue') {
      const taskDeadline = new Date(task.deadline);
      // Reset hours for fair date comparison
      taskDeadline.setHours(23, 59, 59, 999);
      if (taskDeadline < now) {
        // Mark as overdue
        await updateTaskInDB(uid, task.id, { status: 'overdue' });
        hasNewOverdue = true;
      }
    }
    if (task.status === 'overdue' || (task.status !== 'completed' && new Date(task.deadline) < now)) {
      overdueTasksCount++;
    }
  }

  // Check if Rescue Mode Notification was already sent recently (cooldown: 24h)
  const recentRescueNotif = notifications.find(n => 
    n.title.includes('Rescue Mode') && 
    (now.getTime() - new Date(n.createdAt || n.time).getTime() < 24 * 60 * 60 * 1000)
  );

  if (hasNewOverdue && !recentRescueNotif) {
    await createNotificationInDB(uid, {
      title: 'Rescue Mode Activated 🚨',
      desc: `${overdueTasksCount} task(s) became overdue. AI has recalibrated your baseline.`,
      type: 'error',
      read: false,
      time: todayISO
    });
  }

  // 2. Inactivity Detection & Reminders (Cooldown: 12h)
  const pending = tasks.filter(t => t.status !== 'completed' && t.status !== 'overdue');
  
  if (pending.length > 0) {
    const recentReminder = notifications.find(n => 
      n.title.includes('Unfinished Vector Detected') && 
      (now.getTime() - new Date(n.createdAt || n.time).getTime() < 12 * 60 * 60 * 1000)
    );

    if (!recentReminder) {
      const highPriority = pending.find(t => t.priority === 'critical' || t.priority === 'high') || pending[0];
      await createNotificationInDB(uid, {
        title: `Unfinished Vector Detected ⚠️`,
        desc: `You still have '${highPriority.title}' pending. DeadlineOS has prepared an updated execution plan waiting for you.`,
        type: 'warning',
        read: false,
        time: todayISO
      });
    }
  }
  
  // 3. Daily Summary Generation (Run around 8 PM / 20:00)
  if (currentHour === 20) {
    const recentDaily = notifications.find(n => 
      n.title.includes('Daily Summary') && 
      (now.getTime() - new Date(n.createdAt || n.time).getTime() < 20 * 60 * 60 * 1000)
    );
    
    if (!recentDaily) {
      const context = await buildAIContext(uid, '');
      const report = await getBurnoutReport(context, 'professional').catch(() => null);
      if (report && report.burnoutRiskLevel) {
        await createNotificationInDB(uid, {
          title: `Daily Summary: ${report.burnoutRiskLevel.toUpperCase()} Risk 📊`,
          desc: report.recommendation || `Your daily analytics have been generated. Check the dashboard.`,
          type: 'info',
          read: false,
          time: todayISO
        });
      }
    }
  }

  // 4. Weekly Analytics Generation (Run on Sunday at 9 AM)
  if (dayOfWeek === 0 && currentHour === 9) {
    const recentWeekly = notifications.find(n => 
      n.title.includes('Weekly Diagnostics') && 
      (now.getTime() - new Date(n.createdAt || n.time).getTime() < 6 * 24 * 60 * 60 * 1000) // 6 days cooldown
    );
    
    if (!recentWeekly) {
      const context = await buildAIContext(uid, '');
      const diagnostics = await getAIProductivityDiagnostics(context, 'professional').catch(() => null);
      if (diagnostics && diagnostics.improvementRoadmap) {
        await createNotificationInDB(uid, {
          title: `Weekly Diagnostics Ready 📈`,
          desc: `AI generated your weekly progress report. Key focus: ${diagnostics.improvementRoadmap[0] || 'View dashboard'}`,
          type: 'info',
          read: false,
          time: todayISO
        });
      }
    }
  }
}


