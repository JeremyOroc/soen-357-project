import { useState, useMemo, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { v4 as uuidv4 } from 'uuid';
import type { WorkoutEntry } from '../types';
import WeeklyRing from '../components/WeeklyRing';
import StreakBadge from '../components/StreakBadge';
import Toast from '../components/Toast';
import MonthlyRing from '../components/MonthlyRing';

/**
 * Dashboard Page - One-Tap Logging Interface
 * 
 * HCI Principles Applied:
 * - Fitts's Law: Large 80px button, easy to tap
 * - Nielsen #1 (Visibility of System Status): Immediate feedback via confetti, toast, ring pulse
 * - Nielsen #6 (Recognition over Recall): Visual progress, no data entry required
 * - Nielsen #7 (Flexibility & Efficiency): Optional workout tags for power users
 * - Fogg's Behavior Model: Positive reinforcement through celebrations
 * 
 * Study Metrics:
 * - Records session duration (startTime → button press) for comparison with Traditional Tracker
 * - Stored in localStorage under 'kmf_study_dashboard'
 */

// Motivational messages - HCI: Positive reinforcement for habit formation
const MESSAGES = [
  "You showed up. That's everything. 💜",
  "Another day, another win. Keep going!",
  "Consistency beats perfection. Well done!",
  "Progress is progress, no matter how small.",
  "You're building the habit. One day at a time.",
  "The hardest part was starting. You did it!",
];

// Milestone celebrations - HCI: Variable reward schedule (Fogg Behavior Model)
const MILESTONE_MESSAGES: Record<number, string> = {
  3: "3 days strong! You're building a habit 🔥",
  7: "One full week! You're unstoppable 💜",
  14: "2 weeks! You've built a real habit 🏆",
  21: "3 weeks! Habit officially formed! 🌟",
  30: "30 days! You're a legend! 👑",
};

// Workout type tags - HCI: Flexibility & Efficiency of Use (Nielsen #7)
const WORKOUT_TAGS = [
  { id: 'gym', emoji: '🏋️', label: 'Gym' },
  { id: 'run', emoji: '🏃', label: 'Run' },
  { id: 'walk', emoji: '🚶', label: 'Walk' },
  { id: 'yoga', emoji: '🧘', label: 'Yoga' },
  { id: 'other', emoji: '⚡', label: 'Other' },
];

// Daily motivational quotes - HCI: Emotional design & user engagement
const DAILY_QUOTES = [
  { quote: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { quote: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { quote: "Fitness is not about being better than someone else. It's about being better than you used to be.", author: "Khloe Kardashian" },
  { quote: "The body achieves what the mind believes.", author: "Napoleon Hill" },
  { quote: "Don't limit your challenges. Challenge your limits.", author: "Unknown" },
  { quote: "Strength does not come from the body. It comes from the will.", author: "Gandhi" },
  { quote: "Your health is an investment, not an expense.", author: "Unknown" },
];

const STUDY_STORAGE_KEY = 'kmf_study_dashboard';

interface DashboardSession {
  id: string;
  startTime: string;
  endTime: string;
  durationMs: number;
}

function loadStudySessions(): DashboardSession[] {
  try {
    return JSON.parse(localStorage.getItem(STUDY_STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveStudySession(session: DashboardSession): void {
  const sessions = loadStudySessions();
  sessions.push(session);
  localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify(sessions));
}

interface DashboardProps {
  entries: WorkoutEntry[];
  onLog: (tag?: string) => void;
}

function toDateKey(ts: number) {
  return new Date(ts).toISOString().slice(0, 10);
}

function computeStreak(entries: WorkoutEntry[]): number {
  if (entries.length === 0) return 0;
  const days = [...new Set(entries.map(e => toDateKey(e.timestamp)))].sort().reverse();
  const today = toDateKey(Date.now());
  const yesterday = toDateKey(Date.now() - 86_400_000);
  if (days[0] !== today && days[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = (prev.getTime() - curr.getTime()) / 86_400_000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

function alreadyLoggedToday(entries: WorkoutEntry[]): boolean {
  const today = toDateKey(Date.now());
  return entries.some(e => toDateKey(e.timestamp) === today);
}

// Get daily quote based on day of year - ensures same quote all day
function getDailyQuote() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86_400_000);
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

function triggerConfetti(intensity: 'normal' | 'medium' | 'large' = 'normal') {
  const colors = ['#8b5cf6', '#6366f1', '#ffffff', '#f59e0b'];
  const config = {
    normal: { particleCount: 80, spread: 60, origin: { y: 0.7 } },
    medium: { particleCount: 120, spread: 80, origin: { y: 0.6 } },
    large: { particleCount: 180, spread: 100, origin: { y: 0.5 } },
  };
  confetti({ ...config[intensity], colors, disableForReducedMotion: true });
}

function triggerHaptic(pattern: 'single' | 'milestone' = 'single') {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern === 'milestone' ? [80, 50, 80] : 80);
    }
  } catch { /* Vibration not supported */ }
}

export default function Dashboard({ entries, onLog }: DashboardProps) {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [ringPulse, setRingPulse] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Study metrics: Track session start time
  const startTimeRef = useRef<number>(Date.now());

  // Reset timer on mount (for study sessions)
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const streak = useMemo(() => computeStreak(entries), [entries]);
  const loggedToday = useMemo(() => alreadyLoggedToday(entries), [entries]);
  const loggedDays = useMemo(() => [...new Set(entries.map(e => toDateKey(e.timestamp)))], [entries]);
  const dailyQuote = useMemo(() => getDailyQuote(), []);
  
  // Quick stats for dashboard - HCI: Recognition over Recall (Nielsen #6)
  const totalWorkouts = entries.length;
  const thisWeekCount = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return entries.filter(e => e.timestamp >= startOfWeek.getTime()).length;
  }, [entries]);

  function handleLog() {
    if (loggedToday) return;

    // Record study session metrics
    const endTime = Date.now();
    const session: DashboardSession = {
      id: uuidv4(),
      startTime: new Date(startTimeRef.current).toISOString(),
      endTime: new Date(endTime).toISOString(),
      durationMs: endTime - startTimeRef.current,
    };
    saveStudySession(session);

    // Log the workout
    onLog(selectedTag || undefined);
    setSelectedTag(null);
    setRingPulse(true);
    setTimeout(() => setRingPulse(false), 700);

    const newStreak = streak + 1;
    if (MILESTONE_MESSAGES[newStreak]) {
      const intensity = newStreak <= 3 ? 'normal' : newStreak <= 14 ? 'medium' : 'large';
      triggerConfetti(intensity);
      triggerHaptic('milestone');
      setToastMsg(MILESTONE_MESSAGES[newStreak]);
    } else {
      triggerConfetti('normal');
      triggerHaptic('single');
      setToastMsg(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
    }
    setToastVisible(true);

    // Reset timer for next session
    startTimeRef.current = Date.now();
  }

  function handleTagSelect(tagId: string) {
    setSelectedTag(prev => prev === tagId ? null : tagId);
  }

  const buttonClass = loggedToday
    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
    : 'bg-brand-600 hover:bg-brand-500 active:scale-95 text-white shadow-brand-600/40 hover:shadow-brand-500/50 hover:shadow-xl';

  return (
    <main className="max-w-lg mx-auto px-4 py-8 flex flex-col items-center gap-6">
      {/* Header with greeting */}
      <div className="text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Good {greeting()}, athlete 👋
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {loggedToday ? "You've already logged today. See you tomorrow!" : "Tap the button when you're done working out."}
        </p>
      </div>

      {/* Daily Quote Card - HCI: Emotional Design */}
      <section className="w-full bg-gradient-to-br from-brand-50 to-indigo-50 dark:from-brand-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-brand-100 dark:border-brand-800/30 animate-fade-in" style={{ animationDelay: '50ms' }}>
        <p className="text-sm text-slate-700 dark:text-slate-300 italic text-center">
          "{dailyQuote.quote}"
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-1">
          — {dailyQuote.author}
        </p>
      </section>

      {/* Quick Stats Row - HCI: Visibility of System Status (Nielsen #1) */}
      <section className="w-full grid grid-cols-3 gap-3 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="bg-white dark:bg-[#1a1728] rounded-2xl p-3 text-center border border-slate-100 dark:border-slate-700/50">
          <p className="text-xl font-bold text-brand-600 dark:text-brand-400">{streak}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Day Streak</p>
        </div>
        <div className="bg-white dark:bg-[#1a1728] rounded-2xl p-3 text-center border border-slate-100 dark:border-slate-700/50">
          <p className="text-xl font-bold text-brand-600 dark:text-brand-400">{thisWeekCount}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">This Week</p>
        </div>
        <div className="bg-white dark:bg-[#1a1728] rounded-2xl p-3 text-center border border-slate-100 dark:border-slate-700/50">
          <p className="text-xl font-bold text-brand-600 dark:text-brand-400">{totalWorkouts}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">Total</p>
        </div>
      </section>

      {/* Streak Badge */}
      <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
        <StreakBadge streak={streak} />
      </div>

      {/* Weekly Ring */}

<section className="w-full bg-white dark:bg-[#1a1728] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50">
  <div className="grid grid-cols-10 gap-2 items-stretch">
    
    {/* Weekly Progress (70%) */}
    <div className="col-span-7 flex flex-col items-center">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
        Weekly Consistency
      </h2>
      <div className="w-full flex justify-center pb-2">
        <WeeklyRing loggedDays={loggedDays} pulse={ringPulse} />
      </div>
    </div>

    {/* Monthly Progress (30%) */}
    <div className="col-span-3 flex flex-col items-center border-l border-slate-100 dark:border-slate-800 pl-4">
      <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
        Monthly
      </h2>
      <div className="flex items-center justify-center scale-150 origin-center mt-9">
        <MonthlyRing loggedDays={loggedDays} />
      </div>
    </div>

  </div>
</section>

      {/* Workout Type Tags - HCI: Flexibility & Efficiency (Nielsen #7) */}
      {!loggedToday && (
        <section className="w-full animate-fade-in" style={{ animationDelay: '250ms' }}>
          <p className="text-xs text-center text-slate-400 dark:text-slate-500 mb-3">
            Optional: What did you do today?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {WORKOUT_TAGS.map(tag => (
              <button
                key={tag.id}
                onClick={() => handleTagSelect(tag.id)}
                aria-pressed={selectedTag === tag.id}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[36px]
                  ${selectedTag === tag.id 
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
              >
                {tag.emoji} {tag.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* One-Tap Log Button - HCI: Fitts's Law (large target, easy to tap) */}
      <button
        onClick={handleLog}
        disabled={loggedToday}
        aria-label={loggedToday ? "Already logged today" : `Log today's workout${selectedTag ? ` as ${selectedTag}` : ''}`}
        className={`w-full max-w-xs h-20 rounded-3xl text-lg font-bold tracking-wide shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-400/60 animate-fade-in ${buttonClass}`}
        style={{ animationDelay: '300ms' }}
      >
        {loggedToday ? '✓ Done for today' : '+ Log Workout'}
      </button>

      {/* Encouragement text for beginners */}
      {!loggedToday && entries.length < 7 && (
        <p className="text-xs text-center text-slate-400 dark:text-slate-500 max-w-xs animate-fade-in" style={{ animationDelay: '350ms' }}>
          💡 Tip: You don't need to track reps or sets. Just show up and tap!
        </p>
      )}

      <Toast message={toastMsg} visible={toastVisible} onHide={() => setToastVisible(false)} />
    </main>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
