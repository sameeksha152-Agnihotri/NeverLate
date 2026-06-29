import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, Task, Badge, BuddyPersonality, EnergyLevel } from '../types';

const USERS_COLLECTION = 'users';
const TASKS_COLLECTION = 'tasks';

const DEFAULT_BADGES: Badge[] = [
  { id: 'deadline-hero', name: 'Deadline Hero', description: 'Complete 10 tasks on time', icon: '🏆' },
  { id: 'crisis-survivor', name: 'Crisis Survivor', description: 'Complete 5 high-risk tasks', icon: '🔥' },
  { id: 'focus-master', name: 'Focus Master', description: 'Use focus mode for 1 hour total', icon: '🎯' },
  { id: 'consistency-king', name: 'Consistency King', description: 'Maintain a 7-day streak', icon: '👑' },
  { id: 'procrastination-breaker', name: 'Procrastination Breaker', description: 'Zero postponements for a week', icon: '💪' },
];

export async function createUserProfile(uid: string, displayName: string | null, email: string | null, photoURL: string | null): Promise<User> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  const user: User = {
    uid,
    displayName: displayName ?? null,
    email: email ?? null,
    photoURL: photoURL ?? null,
    xp: 0,
    entertainmentMinutes: 0,
    completedCount: 0,
    missedCount: 0,
    badges: DEFAULT_BADGES.map(b => ({ ...b, unlockedAt: undefined })),
    personality: 'supportive-friend',
    energy: 'normal',
    lockedApps: {},
    streakDays: 0,
    lastActiveDate: null,
  };

  await setDoc(doc(db, USERS_COLLECTION, uid), {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    xp: user.xp,
    entertainmentMinutes: user.entertainmentMinutes,
    completedCount: user.completedCount,
    missedCount: user.missedCount,
    badges: user.badges.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
      icon: b.icon,
      unlockedAt: null,
    })),
    personality: user.personality,
    energy: user.energy,
    lockedApps: user.lockedApps,
    streakDays: user.streakDays,
    lastActiveDate: user.lastActiveDate,
    createdAt: serverTimestamp(),
  });

  return user;
}

export async function getUserProfile(uid: string): Promise<User | null> {
  if (!db) {
    return null;
  }

  const docRef = doc(db, USERS_COLLECTION, uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      lastActiveDate: data.lastActiveDate || null,
    } as User;
  }

  return null;
}

export async function updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  const docRef = doc(db, USERS_COLLECTION, uid);

  const sanitizedUpdates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      if (key === 'badges' && Array.isArray(value)) {
        sanitizedUpdates[key] = value.map((badge: Badge) => ({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          unlockedAt: badge.unlockedAt ?? null,
        }));
      } else {
        sanitizedUpdates[key] = value;
      }
    }
  }

  await updateDoc(docRef, sanitizedUpdates);
}

export async function updateUserPersonality(uid: string, personality: BuddyPersonality): Promise<void> {
  await updateUserProfile(uid, { personality });
}

export async function updateUserEnergy(uid: string, energy: EnergyLevel): Promise<void> {
  await updateUserProfile(uid, { energy });
}

export async function addXpToUser(uid: string, xpAmount: number): Promise<void> {
  const user = await getUserProfile(uid);
  if (user) {
    await updateUserProfile(uid, { xp: user.xp + xpAmount });
  }
}

export async function addEntertainmentMinutes(uid: string, minutes: number): Promise<void> {
  const user = await getUserProfile(uid);
  if (user) {
    await updateUserProfile(uid, { entertainmentMinutes: user.entertainmentMinutes + minutes });
  }
}

export async function incrementCompletedCount(uid: string): Promise<void> {
  const user = await getUserProfile(uid);
  if (user) {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = user.lastActiveDate;
    let streakDays = user.streakDays;

    if (lastActive !== today) {
      if (lastActive === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
        streakDays += 1;
      } else {
        streakDays = 1;
      }
    }

    await updateUserProfile(uid, {
      completedCount: user.completedCount + 1,
      streakDays,
      lastActiveDate: today,
    });
  }
}

export async function incrementMissedCount(uid: string): Promise<void> {
  const user = await getUserProfile(uid);
  if (user) {
    await updateUserProfile(uid, {
      missedCount: user.missedCount + 1,
      streakDays: 0,
    });
  }
}

export async function checkAndAwardBadges(uid: string): Promise<Badge[]> {
  const user = await getUserProfile(uid);
  if (!user) return [];

  const newBadges: Badge[] = [];
  const updatedBadges = [...user.badges];

  const findBadge = (id: string) => updatedBadges.find(b => b.id === id);

  if (user.completedCount >= 10) {
    const badge = findBadge('deadline-hero');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = new Date();
      newBadges.push(badge);
    }
  }

  if (user.missedCount === 0 && user.completedCount >= 7) {
    const badge = findBadge('procrastination-breaker');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = new Date();
      newBadges.push(badge);
    }
  }

  if (user.streakDays >= 7) {
    const badge = findBadge('consistency-king');
    if (badge && !badge.unlockedAt) {
      badge.unlockedAt = new Date();
      newBadges.push(badge);
    }
  }

  if (newBadges.length > 0) {
    await updateUserProfile(uid, { badges: updatedBadges });
  }

  return newBadges;
}

export async function createTask(uid: string, taskData: Omit<Task, 'id' | 'userId' | 'riskScore' | 'riskLabel' | 'createdAt'>): Promise<Task> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  const risk = calculateRisk(taskData.estimatedHours, taskData.freeHours, taskData.deadline, taskData.postponeCount);

  const task: Omit<Task, 'id'> = {
    userId: uid,
    title: taskData.title,
    deadline: taskData.deadline,
    estimatedHours: taskData.estimatedHours,
    freeHours: taskData.freeHours,
    postponeCount: taskData.postponeCount ?? 0,
    status: taskData.status ?? 'active',
    riskScore: risk.score,
    riskLabel: risk.label,
    createdAt: new Date(),
  };

  const docRef = await addDoc(collection(db, USERS_COLLECTION, uid, TASKS_COLLECTION), {
    userId: task.userId,
    title: task.title,
    deadline: Timestamp.fromDate(task.deadline),
    estimatedHours: task.estimatedHours,
    freeHours: task.freeHours,
    postponeCount: task.postponeCount,
    status: task.status,
    riskScore: task.riskScore,
    riskLabel: task.riskLabel,
    createdAt: serverTimestamp(),
  });

  return { ...task, id: docRef.id };
}

export async function getUserTasks(uid: string, status?: 'active' | 'completed' | 'missed'): Promise<Task[]> {
  if (!db) {
    return [];
  }

  let q = query(
    collection(db, USERS_COLLECTION, uid, TASKS_COLLECTION),
    orderBy('deadline', 'asc')
  );

  if (status) {
    q = query(
      collection(db, USERS_COLLECTION, uid, TASKS_COLLECTION),
      where('status', '==', status),
      orderBy('deadline', 'asc')
    );
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      deadline: data.deadline?.toDate() || new Date(),
      createdAt: data.createdAt?.toDate() || new Date(),
    } as Task;
  });
}

export async function updateTask(uid: string, taskId: string, updates: Partial<Task>): Promise<void> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  const docRef = doc(db, USERS_COLLECTION, uid, TASKS_COLLECTION, taskId);

  const updateData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      updateData[key] = value;
    }
  }

  if (updates.deadline) {
    updateData.deadline = Timestamp.fromDate(updates.deadline);
  }

  if (updates.estimatedHours !== undefined || updates.freeHours !== undefined || updates.postponeCount !== undefined) {
    const existingTask = await getDoc(docRef);
    if (existingTask.exists()) {
      const data = existingTask.data() as Task;
      const risk = calculateRisk(
        updates.estimatedHours ?? data.estimatedHours,
        updates.freeHours ?? data.freeHours,
        updates.deadline ?? data.deadline,
        updates.postponeCount ?? data.postponeCount
      );
      updateData.riskScore = risk.score;
      updateData.riskLabel = risk.label;
    }
  }

  await updateDoc(docRef, updateData);
}

export async function deleteTask(uid: string, taskId: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  const docRef = doc(db, USERS_COLLECTION, uid, TASKS_COLLECTION, taskId);
  await deleteDoc(docRef);
}

export async function completeTask(uid: string, taskId: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  const docRef = doc(db, USERS_COLLECTION, uid, TASKS_COLLECTION, taskId);
  const existingTask = await getDoc(docRef);

  if (existingTask.exists()) {
    const taskData = existingTask.data() as Task;
    const riskScore = taskData.riskScore;

    let xpGained = 50;
    let minutesGained = 15;

    if (riskScore >= 85) {
      xpGained = 100;
      minutesGained = 30;
    } else if (riskScore >= 70) {
      xpGained = 75;
      minutesGained = 20;
    }

    await updateDoc(docRef, { status: 'completed' });
    await addXpToUser(uid, xpGained);
    await addEntertainmentMinutes(uid, minutesGained);
    await incrementCompletedCount(uid);
    await checkAndAwardBadges(uid);
  }
}

export async function postponeTask(uid: string, taskId: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  const docRef = doc(db, USERS_COLLECTION, uid, TASKS_COLLECTION, taskId);
  const existingTask = await getDoc(docRef);

  if (existingTask.exists()) {
    const data = existingTask.data() as Task;
    const newPostponeCount = (data.postponeCount || 0) + 1;

    const risk = calculateRisk(data.estimatedHours, data.freeHours, data.deadline, newPostponeCount);

    await updateDoc(docRef, {
      postponeCount: newPostponeCount,
      riskScore: risk.score,
      riskLabel: risk.label,
    });
  }
}

export async function markTaskAsMissed(uid: string, taskId: string): Promise<void> {
  if (!db) {
    throw new Error('Firestore not initialized');
  }

  const docRef = doc(db, USERS_COLLECTION, uid, TASKS_COLLECTION, taskId);
  await updateDoc(docRef, { status: 'missed' });
  await incrementMissedCount(uid);
}

function calculateRisk(estimatedHours: number, freeHours: number, deadline: Date, postponeCount: number): { score: number; label: 'safe' | 'moderate' | 'high' | 'critical' } {
  const now = new Date();
  const hoursUntilDeadline = Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60));

  let score = 0;

  const hoursRatio = hoursUntilDeadline > 0 ? estimatedHours / Math.max(freeHours, 0.5) : 2;
  if (hoursRatio > 2) score += 40;
  else if (hoursRatio > 1.5) score += 30;
  else if (hoursRatio > 1) score += 20;
  else if (hoursRatio > 0.5) score += 10;

  if (hoursUntilDeadline < 2) score += 40;
  else if (hoursUntilDeadline < 6) score += 30;
  else if (hoursUntilDeadline < 24) score += 20;
  else if (hoursUntilDeadline < 48) score += 10;

  score += Math.min(postponeCount * 8, 24);

  score = Math.min(100, Math.max(0, score));

  let label: 'safe' | 'moderate' | 'high' | 'critical';
  if (score >= 85) label = 'critical';
  else if (score >= 65) label = 'high';
  else if (score >= 40) label = 'moderate';
  else label = 'safe';

  return { score: Math.round(score), label };
}
