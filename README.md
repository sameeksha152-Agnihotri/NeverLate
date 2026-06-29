# NeverLate - AI-Powered Productivity Companion

NeverLate helps students and professionals avoid missing deadlines through proactive AI intervention, not passive reminders.

## Features

### Core Features (Tier 1)

- **Firebase Authentication** - Google Sign-In and Email/Password authentication
- **Deadline Risk Meter** - Real-time risk calculation (0-100) displayed as a radial gauge with color-coded urgency
- **AI Rescue Mode** - Break high-risk tasks into 4-6 micro-steps under 25 minutes each
- **AI Buddy** - Floating avatar with mood reflecting your task risk, personality-aware messaging
- **Panic Button** - AI categorizes tasks into Do Now, Do Later, and Ignore Today
- **Task Management** - Full CRUD operations with deadline tracking, postponement logging

### Advanced Features (Tier 2)

- **AI Excuse Detector** - Identifies procrastination patterns when tasks are postponed
- **Future Self Simulator** - Shows tomorrow's outcome if task is completed vs ignored
- **Fake Accountability Call** - Simulated incoming call with urgency script
- **Energy-Based Scheduling** - Task recommendations based on energy level
- **Productivity Streak City** - Visual city that grows with completed tasks
- **Focus Bubble Mode** - Single-task focus timer
- **Achievement Badges** - Unlock badges like Deadline Hero, Crisis Survivor, Focus Master
- **Humorous Roast Feedback** - Personalized feedback on procrastination patterns
- **XP & Rewards** - Earn XP for completing tasks, spend on entertainment minutes

## Buddy Personality Modes

1. **Strict Teacher** - Firm, direct, academic discipline
2. **Supportive Friend** - Warm, encouraging, casual
3. **Professional Coach** - Strategic, actionable focus
4. **Funny Buddy** - Witty, humorous motivation
5. **Drill Sergeant** - Intense, military-style urgency

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication with Google and Email/Password providers
4. Create a Firestore database
5. Go to Project Settings and copy your config values

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Configure Gemini AI

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key

Add to your `.env` file:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run the Development Server

```bash
npm run dev
```

## Firestore Data Model

### Users Collection

```typescript
{
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
```

### Tasks Subcollection (per user)

```typescript
{
  id: string;
  title: string;
  deadline: Date;
  estimatedHours: number;
  freeHours: number;
  postponeCount: number;
  status: 'active' | 'completed' | 'missed';
  riskScore: number;
  riskLabel: 'safe' | 'moderate' | 'high' | 'critical';
  createdAt: Date;
}
```

## Tech Stack

- **React** with TypeScript
- **Vite** for build tooling
- **Firebase** Authentication & Firestore
- **Google Gemini AI** for all AI features
- **Framer Motion** for animations
- **Lucide React** for icons

## Design

- Dark "Mission Control" aesthetic
- Near-navy background (#0a0f1a)
- Amber/orange for urgency
- Mint/teal for safe states
- Red for critical states
- Risk Meter styled like a heartbeat/vital monitor

## License

MIT
"# NeverLate" 
