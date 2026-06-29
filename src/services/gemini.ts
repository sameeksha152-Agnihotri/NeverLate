import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Task, BuddyPersonality, RescueStep, PanicBucket } from '../types';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

function getPersonalityPrompt(personality: BuddyPersonality): string {
  switch (personality) {
    case 'strict-teacher':
      return 'You are a strict, no-nonsense teacher. Be firm, direct, and hold the user accountable. Use academic language and reference concepts like discipline, structure, and consequences. Keep responses concise (2-3 sentences max).';
    case 'supportive-friend':
      return 'You are a warm, encouraging best friend. Be supportive, empathetic, and use casual friendly language. Show genuine care while gently nudging toward action. Keep responses short and sweet (2-3 sentences).';
    case 'professional-coach':
      return 'You are a professional life coach. Use coaching methodologies, ask powerful questions, and focus on actionable next steps. Be motivating and strategic. Keep responses focused and practical (2-3 sentences).';
    case 'funny-buddy':
      return 'You are a witty, humorous companion. Use puns, jokes, and light teasing while still helping the user stay productive. Make them smile while getting things done. Keep it brief and funny (2-3 sentences).';
    case 'drill-sergeant':
      return 'You are an intense drill sergeant. Be commanding, use military-style urgency, and demand immediate action. Drop the excuse-making and get moving soldier! Keep it punchy and intense (2-3 sentences).';
    default:
      return 'You are a helpful productivity assistant. Be encouraging and action-oriented. Keep responses brief (2-3 sentences).';
  }
}

export async function getBuddyMessage(
  personality: BuddyPersonality,
  riskiestTask: Task | null,
  activeTasks: Task[]
): Promise<string> {
  if (!genAI) {
    return 'Connect your Gemini API key to unlock AI features!';
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const context = riskiestTask
    ? `Risky task: "${riskiestTask.title}" (Deadline: ${riskiestTask.deadline.toLocaleString()}, Risk: ${riskiestTask.riskScore}%). ${activeTasks.length} total active tasks.`
    : `No active tasks right now. User has ${activeTasks.length} tasks tracked.`;

  const prompt = `${getPersonalityPrompt(personality)}

Current situation: ${context}

Generate a brief, personality-appropriate message to the user about their productivity situation. Be specific to their current task(s) and motivate appropriate action. Do not use emojis excessively.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Having trouble connecting right now. Please try again!';
  }
}

export async function generateRescueSteps(task: Task, personality: BuddyPersonality): Promise<RescueStep[]> {
  if (!genAI) {
    return generateFallbackRescueSteps(task);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `${getPersonalityPrompt(personality)}

Task: "${task.title}"
Estimated hours needed: ${task.estimatedHours}
Hours until deadline: ${Math.max(0, Math.round((task.deadline.getTime() - Date.now()) / (1000 * 60 * 60)))}
Risk level: ${task.riskScore}%

Break this task into 4-6 tiny, concrete action steps. Each step should take under 25 minutes.
Format your response as a numbered list with each item being a clear action step. Include a time estimate in minutes for each step.

Example format:
1. Write the introduction paragraph - 20 mins
2. Create the outline structure - 15 mins
3. etc.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const steps: RescueStep[] = [];
    const lines = text.split('\n').filter(line => line.trim());

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^\d+\.\s*(.+?)(?:\s*-\s*(\d+)\s*mins?)?$/i);

      if (match) {
        steps.push({
          id: `step-${i + 1}`,
          description: match[1].trim(),
          duration: match[2] ? parseInt(match[2]) : 20,
          completed: false,
        });
      }
    }

    return steps.length > 0 ? steps.slice(0, 6) : generateFallbackRescueSteps(task);
  } catch (error) {
    console.error('Gemini API error:', error);
    return generateFallbackRescueSteps(task);
  }
}

function generateFallbackRescueSteps(task: Task): RescueStep[] {
  const steps: RescueStep[] = [
    { id: 'step-1', description: `Gather all materials needed for "${task.title}"`, duration: 10, completed: false },
    { id: 'step-2', description: 'Set up your workspace and eliminate distractions', duration: 5, completed: false },
    { id: 'step-3', description: 'Write down the core requirements or goals', duration: 15, completed: false },
    { id: 'step-4', description: 'Complete the first 20-minute focused work session', duration: 20, completed: false },
    { id: 'step-5', description: 'Take a 5-minute break and assess progress', duration: 5, completed: false },
    { id: 'step-6', description: 'Complete final work session and wrap up', duration: 20, completed: false },
  ];
  return steps;
}

export async function generatePanicBucket(activeTasks: Task[], personality: BuddyPersonality): Promise<PanicBucket> {
  if (!genAI || activeTasks.length === 0) {
    return generateFallbackPanicBucket(activeTasks);
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const tasksContext = activeTasks
    .slice(0, 10)
    .map((t, i) => `${i + 1}. "${t.title}" - Risk: ${t.riskScore}%, Deadline: ${t.deadline.toLocaleString()}`)
    .join('\n');

  const prompt = `${getPersonalityPrompt(personality)}

User is overwhelmed with these active tasks:
${tasksContext}

Categorize these into THREE buckets based on urgency and importance:
- DO NOW (max 3 tasks that absolutely must be done today)
- DO LATER (tasks that can wait until tomorrow or beyond)
- IGNORE TODAY (tasks to intentionally skip today to reduce overwhelm)

Return ONLY a JSON object with this exact structure (no markdown, just the JSON):
{"doNow": [task numbers], "doLater": [task numbers], "ignoreToday": [task numbers]}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      return {
        doNow: parsed.doNow?.slice(0, 3).map((i: number) => activeTasks[i - 1]).filter(Boolean) || [],
        doLater: parsed.doLater?.map((i: number) => activeTasks[i - 1]).filter(Boolean) || [],
        ignoreToday: parsed.ignoreToday?.map((i: number) => activeTasks[i - 1]).filter(Boolean) || [],
      };
    }
  } catch (error) {
    console.error('Gemini API error:', error);
  }

  return generateFallbackPanicBucket(activeTasks);
}

function generateFallbackPanicBucket(tasks: Task[]): PanicBucket {
  const sorted = [...tasks].sort((a, b) => b.riskScore - a.riskScore);

  return {
    doNow: sorted.slice(0, 3),
    doLater: sorted.slice(3, 6),
    ignoreToday: sorted.slice(6),
  };
}

export async function analyzeProcrastinationPattern(
  task: Task,
  personality: BuddyPersonality
): Promise<string> {
  if (!genAI) {
    return 'You tend to postpone tasks when they feel overwhelming. Try breaking them into smaller steps!';
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `${getPersonalityPrompt(personality)}

Task: "${task.title}"
Postponement count: ${task.postponeCount}
Estimated hours: ${task.estimatedHours}

The user has postponed this task ${task.postponeCount} time(s). Identify their likely procrastination pattern and suggest ONE specific action under 15 minutes that will help break this pattern. Be direct and specific.

Keep your response to 2 sentences maximum.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Try starting with just 5 minutes of work on this task. Often beginning is the hardest part!';
  }
}

export async function generateFutureComparison(
  task: Task,
  personality: BuddyPersonality
): Promise<{ ifCompleted: string; ifIgnored: string }> {
  if (!genAI) {
    return {
      ifCompleted: 'Tomorrow you will feel accomplished and stress-free.',
      ifIgnored: 'Tomorrow you will feel guilty and rushed.',
    };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `${getPersonalityPrompt(personality)}

Task: "${task.title}"
Deadline: ${task.deadline.toLocaleString()}

Imagine two versions of tomorrow:

1. If the task is completed today: Describe in 1-2 sentences how tomorrow will feel
2. If the task is ignored today: Describe in 1-2 sentences how tomorrow will feel

Make it emotional and vivid but brief. Return ONLY two lines separated by a newline, starting with "COMPLETED: " and "IGNORED: "`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const completedMatch = text.match(/COMPLETED:\s*(.+)/);
    const ignoredMatch = text.match(/IGNORED:\s*(.+)/);

    return {
      ifCompleted: completedMatch?.[1] || 'Tomorrow brings a sense of accomplishment and freedom.',
      ifIgnored: ignoredMatch?.[1] || 'Tomorrow brings stress and regret.',
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      ifCompleted: 'Tomorrow: accomplished, relaxed, and ready for new challenges.',
      ifIgnored: 'Tomorrow: stressed, behind schedule, and mentally drained.',
    };
  }
}

export async function getEnergyBasedTaskRecommendation(
  tasks: Task[],
  energy: 'tired' | 'normal' | 'energetic',
  personality: BuddyPersonality
): Promise<string> {
  if (!genAI || tasks.length === 0) {
    const sorted = [...tasks].sort((a, b) => b.riskScore - a.riskScore);
    return `Focus on: "${sorted[0].title}" - it has the highest risk score at ${sorted[0].riskScore}%.`;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const tasksContext = tasks
    .slice(0, 8)
    .map((t, i) => `${i + 1}. "${t.title}" - Hours needed: ${t.estimatedHours}, Risk: ${t.riskScore}%`)
    .join('\n');

  const energyContext = {
    tired: 'User is tired and has low energy - suggest 1 low-effort task',
    normal: 'User has normal energy - suggest 1-2 medium tasks',
    energetic: 'User is full of energy - suggest tackling the hardest high-impact task',
  };

  const prompt = `${getPersonalityPrompt(personality)}

Energy level: ${energy}
${energyContext[energy]}

Active tasks:
${tasksContext}

Recommend ONE specific task for this energy level and briefly explain why (1-2 sentences). Format: "Work on: [task name] - [reason]"`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    const sorted = [...tasks].sort((a, b) => b.riskScore - a.riskScore);
    return `Work on: "${sorted[0].title}" - highest priority with ${sorted[0].riskScore}% risk.`;
  }
}

export async function generateAccountabilityScript(
  task: Task,
  personality: BuddyPersonality
): Promise<string> {
  if (!genAI) {
    return `This is your productivity buddy calling about "${task.title}". It's critical - let's get it done now!`;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const hoursLeft = Math.max(0, Math.round((task.deadline.getTime() - Date.now()) / (1000 * 60 * 60)));

  const prompt = `${getPersonalityPrompt(personality)}

You are making a fake "accountability call" to the user about their highest-risk task:
"${task.title}"
Risk score: ${task.riskScore}%
Hours until deadline: ${hoursLeft}

Write a brief urgency script (2-3 sentences) that sounds like someone calling to hold them accountable. Make it sound like a real phone call opening. Do not use excessive emoji.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return `Hey! I'm calling about "${task.title}". You have ${hoursLeft} hours left and I know you can crush this. Let's go!`;
  }
}

export async function generateRoast(
  tasks: Task[],
  postponeCount: number,
  personality: BuddyPersonality
): Promise<string> {
  if (!genAI) {
    return 'Procrastination is an art form, but you are taking it to the next level!';
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const tasksContext = tasks
    .slice(0, 5)
    .map((t) => `"${t.title}" (Risk: ${t.riskScore}%, Postponed: ${t.postponeCount}x)`)
    .join('\n');

  const prompt = `${getPersonalityPrompt(personality)}

User has these procrastinated tasks:
${tasksContext}

Total postponements across all tasks: ${postponeCount}

Generate a brief, humorous "roast" (1-2 sentences) about their procrastination patterns. Be funny but not mean-spirited. The goal is to make them smile while nudging them to action.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return 'Your postpone button is getting more exercise than you are!';
  }
}

export async function verifyWorkWithVision(
  imageBase64: string,
  taskTitle: string
): Promise<{ verified: boolean; message: string }> {
  if (!genAI) {
    return {
      verified: true,
      message: 'Work verified! Entertainment minutes unlocked.',
    };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent([
      {
        text: `A user is proving they completed work on this task: "${taskTitle}"
Analyze this screenshot/image. Does it appear to show genuine work related to this task?
Answer with: "VERIFIED: [reason]" or "UNVERIFIED: [reason]" followed by a brief friendly message (1 sentence).`,
      },
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    if (text.toLocaleUpperCase().includes('VERIFIED')) {
      return {
        verified: true,
        message: text.replace(/VERIFIED:\s*/i, ''),
      };
    } else {
      return {
        verified: false,
        message: 'Could not verify work. Please upload a clearer screenshot.',
      };
    }
  } catch (error) {
    console.error('Gemini Vision API error:', error);
    return {
      verified: true,
      message: 'Work accepted! Entertainment minutes have been unlocked.',
    };
  }
}
