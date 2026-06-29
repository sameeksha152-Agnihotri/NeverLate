export type BuddyPersonality =
  | 'strict-teacher'
  | 'supportive-friend'
  | 'professional-coach'
  | 'funny-buddy'
  | 'drill-sergeant';

export type TaskStatus = 'active' | 'completed' | 'missed';
export type RiskLabel = 'safe' | 'moderate' | 'high' | 'critical';
export type EnergyLevel = 'tired' | 'normal' | 'energetic';

export interface Task {
  id: string;
  title: string;
  deadline: Date;
  estimatedHours: number;
  freeHours: number;
  postponeCount: number;
  status: TaskStatus;
  riskScore: number;
  riskLabel: RiskLabel;
  createdAt: Date;
  userId: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export interface LockedApp {
  name: string;
  lockedAt: Date;
  unlockMinutes: number;
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  xp: number;
  entertainmentMinutes: number;
  completedCount: number;
  missedCount: number;
  badges: Badge[];
  personality: BuddyPersonality;
  energy: EnergyLevel;
  lockedApps: Record<string, LockedApp>;
  streakDays: number;
  lastActiveDate: string | null;
}

export interface RescueStep {
  id: string;
  description: string;
  duration: number;
  completed: boolean;
}

export interface PanicBucket {
  doNow: Task[];
  doLater: Task[];
  ignoreToday: Task[];
}
