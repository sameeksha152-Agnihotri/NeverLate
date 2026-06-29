import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  createTask as createTaskInFirestore,
  getUserTasks,
  updateTask as updateTaskInFirestore,
  deleteTask as deleteTaskFromFirestore,
  completeTask as completeTaskInFirestore,
  postponeTask as postponeTaskInFirestore,
} from '../services/firestore';
import type { Task } from '../types';

interface TaskContextType {
  tasks: Task[];
  activeTasks: Task[];
  completedTasks: Task[];
  missedTasks: Task[];
  loading: boolean;
  createTask: (taskData: Omit<Task, 'id' | 'userId' | 'riskScore' | 'riskLabel' | 'createdAt'>) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  postponeTask: (taskId: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
  getRiskiestTask: () => Task | null;
  getAverageRisk: () => number;
}

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { firebaseUser, refreshUserProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const activeTasks = tasks.filter((t) => t.status === 'active');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const missedTasks = tasks.filter((t) => t.status === 'missed');

  const refreshTasks = useCallback(async () => {
    if (!firebaseUser) {
      setTasks([]);
      return;
    }

    setLoading(true);
    try {
      const fetchedTasks = await getUserTasks(firebaseUser.uid);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const createTask = async (
    taskData: Omit<Task, 'id' | 'userId' | 'riskScore' | 'riskLabel' | 'createdAt'>
  ): Promise<Task> => {
    if (!firebaseUser) {
      throw new Error('User not authenticated');
    }

    const newTask = await createTaskInFirestore(firebaseUser.uid, taskData);
    setTasks((prev) => [...prev, newTask]);
    return newTask;
  };

  const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
    if (!firebaseUser) {
      throw new Error('User not authenticated');
    }

    await updateTaskInFirestore(firebaseUser.uid, taskId, updates);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, ...updates }
          : t
      )
    );
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    if (!firebaseUser) {
      throw new Error('User not authenticated');
    }

    await deleteTaskFromFirestore(firebaseUser.uid, taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const completeTask = async (taskId: string): Promise<void> => {
    if (!firebaseUser) {
      throw new Error('User not authenticated');
    }

    await completeTaskInFirestore(firebaseUser.uid, taskId);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: 'completed' as const } : t
      )
    );
    await refreshUserProfile();
  };

  const postponeTask = async (taskId: string): Promise<void> => {
    if (!firebaseUser) {
      throw new Error('User not authenticated');
    }

    await postponeTaskInFirestore(firebaseUser.uid, taskId);
    await refreshTasks();
  };

  const getRiskiestTask = (): Task | null => {
    const active = tasks.filter((t) => t.status === 'active');
    if (active.length === 0) return null;
    return active.reduce((max, t) => (t.riskScore > max.riskScore ? t : max));
  };

  const getAverageRisk = (): number => {
    const active = tasks.filter((t) => t.status === 'active');
    if (active.length === 0) return 0;
    const sum = active.reduce((acc, t) => acc + t.riskScore, 0);
    return Math.round(sum / active.length);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        activeTasks,
        completedTasks,
        missedTasks,
        loading,
        createTask,
        updateTask,
        deleteTask,
        completeTask,
        postponeTask,
        refreshTasks,
        getRiskiestTask,
        getAverageRisk,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
