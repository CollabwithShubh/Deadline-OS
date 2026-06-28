import { getDb } from '../database/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  writeBatch
} from 'firebase/firestore';

export interface UserProfileDB {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tier: 'PRO' | 'ENTERPRISE';
  timezone: string;
  dailyGoal: number;
  createdAt: string;
  updatedAt: string;
}

export async function migrateUserToUid(oldId: string, newUid: string): Promise<void> {
  const db = getDb();
  try {
    const userDoc = await getDoc(doc(db, 'users', oldId));
    if (!userDoc.exists()) return;

    // 1. Move User Profile
    await setDoc(doc(db, 'users', newUid), {
      ...userDoc.data(),
      id: newUid,
      updatedAt: new Date().toISOString()
    });

    // 2. Move Tasks
    const tasksQ = query(collection(db, 'tasks'), where('userId', '==', oldId));
    const tasksSnap = await getDocs(tasksQ);
    for (const d of tasksSnap.docs) {
      await setDoc(doc(db, 'tasks', d.id), { userId: newUid }, { merge: true });
    }

    // 3. Move Plans
    const plansQ = query(collection(db, 'plans'), where('userId', '==', oldId));
    const plansSnap = await getDocs(plansQ);
    for (const d of plansSnap.docs) {
      await setDoc(doc(db, 'plans', d.id), { userId: newUid }, { merge: true });
    }

    // 4. Move Sessions
    const sessionsQ = query(collection(db, 'sessions'), where('userId', '==', oldId));
    const sessionsSnap = await getDocs(sessionsQ);
    for (const d of sessionsSnap.docs) {
      await setDoc(doc(db, 'sessions', d.id), { userId: newUid }, { merge: true });
    }

    // 5. Move Notifications
    const notifQ = query(collection(db, 'notifications'), where('userId', '==', oldId));
    const notifSnap = await getDocs(notifQ);
    for (const d of notifSnap.docs) {
      await setDoc(doc(db, 'notifications', d.id), { userId: newUid }, { merge: true });
    }

    // 6. Move Messages
    const msgQ = query(collection(db, 'messages'), where('userId', '==', oldId));
    const msgSnap = await getDocs(msgQ);
    for (const d of msgSnap.docs) {
      await setDoc(doc(db, 'messages', d.id), { userId: newUid }, { merge: true });
    }

    // 7. Delete Old Profile
    await deleteDoc(doc(db, 'users', oldId));

    console.log(`Migrated user from ${oldId} to ${newUid}`);
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfileDB | null> {
  const db = getDb();
  try {
    const uidDoc = await getDoc(doc(db, 'users', uid));
    if (uidDoc.exists()) {
      return { id: uidDoc.id, ...uidDoc.data() } as UserProfileDB;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function createUserProfile(uid: string, email: string, name: string, avatarUrl?: string): Promise<UserProfileDB> {
  const db = getDb();
  try {
    const existing = await getUserProfile(uid);
    if (existing) {
      return existing;
    }

    const newUser: UserProfileDB = {
      id: uid,
      name,
      email: email.toLowerCase().trim(),
      avatar: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop',
      tier: 'PRO',
      timezone: 'UTC-7 (Pacific Standard Time)',
      dailyGoal: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', uid), newUser);
    
    // Seed default notifications for new user
    const notifCol = collection(db, 'notifications');
    await addDoc(notifCol, {
      userId: uid,
      title: 'System Initialized',
      desc: 'DeadlineOS neural focus gateway successfully established.',
      type: 'success',
      read: false,
      time: 'Just now',
      createdAt: new Date().toISOString()
    });

    return newUser;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export async function getTasksFromDB(userId: string): Promise<any[]> {
  const db = getDb();
  try {
    const q = query(collection(db, 'tasks'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const tasks: any[] = [];
    querySnapshot.forEach((docSnap) => {
      tasks.push({ id: docSnap.id, ...docSnap.data() });
    });
    // Sort client-side by deadline or creation time if no index exists
    return tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

export async function createTaskInDB(userId: string, taskData: any): Promise<any> {
  const db = getDb();
  try {
    const taskCol = collection(db, 'tasks');
    const newTask = {
      userId,
      ...taskData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const docRef = await addDoc(taskCol, newTask);
    return { id: docRef.id, ...newTask };
  } catch (error) {
    console.error('Error saving task:', error);
    throw error;
  }
}

export async function updateTaskInDB(userId: string, taskId: string, taskData: any): Promise<any> {
  const db = getDb();
  try {
    const docRef = doc(db, 'tasks', taskId);
    const updates = {
      ...taskData,
      updatedAt: new Date().toISOString()
    };
    // Exclude userId from update just in case
    delete updates.userId;
    delete updates.id;
    
    await setDoc(docRef, updates, { merge: true });
    return { id: taskId, ...updates };
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

export async function deleteTaskFromDB(userId: string, taskId: string): Promise<void> {
  const db = getDb();
  try {
    const docRef = doc(db, 'tasks', taskId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

export async function createPlanInDB(userId: string, planData: any): Promise<any> {
  const db = getDb();
  try {
    const plansCol = collection(db, 'plans');
    const newPlan = {
      userId,
      ...planData,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(plansCol, newPlan);
    return { id: docRef.id, ...newPlan };
  } catch (error) {
    console.error('Error saving plan:', error);
    throw error;
  }
}

export async function getPlansFromDB(userId: string): Promise<any[]> {
  const db = getDb();
  try {
    const q = query(collection(db, 'plans'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const plans: any[] = [];
    querySnapshot.forEach((docSnap) => {
      plans.push({ id: docSnap.id, ...docSnap.data() });
    });
    return plans.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    console.error('Error fetching plans:', error);
    return [];
  }
}

export async function updatePlanInDB(userId: string, planId: string, updates: any): Promise<any> {
  const db = getDb();
  try {
    const docRef = doc(db, 'plans', planId);
    await setDoc(docRef, updates, { merge: true });
    return { id: planId, ...updates };
  } catch (error) {
    console.error('Error updating plan:', error);
    throw error;
  }
}

export async function createSessionInDB(userId: string, sessionData: any): Promise<any> {
  const db = getDb();
  try {
    const sessionsCol = collection(db, 'sessions');
    const newSession = {
      userId,
      ...sessionData,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(sessionsCol, newSession);
    return { id: docRef.id, ...newSession };
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

export async function getSessionsFromDB(userId: string): Promise<any[]> {
  const db = getDb();
  try {
    const q = query(collection(db, 'sessions'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const sessions: any[] = [];
    querySnapshot.forEach((docSnap) => {
      sessions.push({ id: docSnap.id, ...docSnap.data() });
    });
    return sessions;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
}

export async function getNotificationsFromDB(userId: string): Promise<any[]> {
  const db = getDb();
  try {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const notifs: any[] = [];
    querySnapshot.forEach((docSnap) => {
      notifs.push({ id: docSnap.id, ...docSnap.data() });
    });
    return notifs;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

export async function createNotificationInDB(userId: string, notifData: any): Promise<any> {
  const db = getDb();
  try {
    const notifCol = collection(db, 'notifications');
    const newNotif = {
      userId,
      ...notifData,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(notifCol, newNotif);
    return { id: docRef.id, ...newNotif };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function getMessagesFromDB(userId: string): Promise<any[]> {
  const db = getDb();
  try {
    const q = query(collection(db, 'messages'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const messages: any[] = [];
    querySnapshot.forEach((docSnap) => {
      messages.push({ dbId: docSnap.id, ...docSnap.data() });
    });
    return messages.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export async function createMessageInDB(userId: string, msgData: any): Promise<any> {
  const db = getDb();
  try {
    const msgCol = collection(db, 'messages');
    const newMsg = {
      userId,
      ...msgData,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(msgCol, newMsg);
    return { dbId: docRef.id, ...newMsg };
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
}

export async function deleteNotificationFromDB(userId: string, notifId: string): Promise<void> {
  const db = getDb();
  try {
    const docRef = doc(db, 'notifications', notifId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

export type BatchOperation = 
  | { type: 'set'; collection: string; id: string; data: any }
  | { type: 'add'; collection: string; data: any; outId?: { id: string } }
  | { type: 'update'; collection: string; id: string; data: any }
  | { type: 'delete'; collection: string; id: string };

export async function executeBatch(operations: BatchOperation[]): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);

  for (const op of operations) {
    if (op.type === 'set') {
      batch.set(doc(db, op.collection, op.id), op.data);
    } else if (op.type === 'add') {
      const docRef = doc(collection(db, op.collection));
      batch.set(docRef, op.data);
      if (op.outId) op.outId.id = docRef.id;
    } else if (op.type === 'update') {
      batch.set(doc(db, op.collection, op.id), op.data, { merge: true });
    } else if (op.type === 'delete') {
      batch.delete(doc(db, op.collection, op.id));
    }
  }

  await batch.commit();
}
