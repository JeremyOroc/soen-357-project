import { useState, useMemo } from 'react';
import type { WorkoutEntry } from '../types';
import WeeklyRing from '../components/WeeklyRing';
import StreakBadge from '../components/StreakBadge';
import Toast from '../components/Toast';

const MESSAGES = [
  "You showed up. That's everything. 💜",
  "Another day, another win. Keep going!",
  "Consistency beats perfection. Well done!",
  "Progress is progress, no matter how small.",
  "You're building the habit. One day at a time.",
  "The hardest part was starting. You did it!",
];

interface DashboardProps {
  entries: WorkoutEntry[];
  onLog: () => void;
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
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function alreadyLoggedToday(entries: WorkoutEntry[]): boolean {
  const today = toDateKey(Date.now());
  return entries.some(e => toDateKey(e.timestamp) === today);
}

export default function Dashboard({ entries, onLog }: DashboardProps) {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const streak = useMemo(() => computeStreak(entries), [entries]);
  const loggedToday = useMemo(() => alreadyLoggedToday(entries), [entries]);
  const loggedDays = useMemo(() => [...new Set(entries.map(e => toDateKey(e.timestamp)))], [entries]);

  function handleLog() {
    if (loggedToday) return;
    onLog();
    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    setToastMsg(msg);
    setToastVisible(true);
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10 flex flex-col items-center gap-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Good {greeting()}, athlete 👋
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {loggedToday
            ? "You've already logged today. See you tomorrow!"
            : "Tap the button when you're done working out."}
        </p>
      </div>

      {/* Streak */}
      <StreakBadge streak={streak} />

      {/* Weekly Ring */}
      <section className="w-full bg-white dark:bg-[#1a1728] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col items-center">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6">
          Weekly Consistency
        </h2>
        <WeeklyRing loggedDays={loggedDays} />
      </section>

      {/* One-Tap Button */}
      <button
        onClick={handleLog}
        disabled={loggedToday}
        aria-label="Log today's workout"
        className={`w-full max-w-xs h-20 rounded-3xl text-lg font-bold tracking-wide shadow-lg transition-all duration-200
          focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-400/60
          ${loggedToday
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
            : 'bg-brand-600 hover:bg-brand-500 active:scale-95 text-white shadow-brand-600/40 hover:shadow-brand-500/50 hover:shadow-xl'
          }`}
      >
        {loggedToday ? '✓ Done for today' : '+ Log Workout'}
      </button>

      <Toast
        message={toastMsg}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
      />
    </main>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
