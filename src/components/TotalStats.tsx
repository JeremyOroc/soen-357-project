import type { WorkoutEntry } from '../types';

interface StatsProps {
  entries: WorkoutEntry[];
}

function toDateKey(ts: number) {
  return new Date(ts).toISOString().slice(0, 10);
}

function computeAllTimeStats(entries: WorkoutEntry[]) {
  if (entries.length === 0) {
    return { totalWorkouts: 0, uniqueDays: 0, longestStreak: 0, firstWorkout: null, mostActiveDay: null, favoriteWorkout: null };
  }

  const days = [...new Set(entries.map(e => toDateKey(e.timestamp)))].sort();
  const uniqueDays = days.length;
  const totalWorkouts = entries.length;
  const firstWorkout = new Date(Math.min(...entries.map(e => e.timestamp)));

  // Calculate longest streak
  let longestStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86_400_000;
    if (diff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  // Most active day of week - HCI: Recognition over Recall
  const dayCount: Record<number, number> = {};
  entries.forEach(e => {
    const day = new Date(e.timestamp).getDay();
    dayCount[day] = (dayCount[day] || 0) + 1;
  });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const mostActiveDayNum = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0];
  const mostActiveDay = mostActiveDayNum !== undefined ? dayNames[parseInt(mostActiveDayNum)] : null;

  // Favorite workout type
  const tagCount: Record<string, number> = {};
  entries.forEach(e => {
    if (e.tag) {
      tagCount[e.tag] = (tagCount[e.tag] || 0) + 1;
    }
  });
  const favoriteWorkout = Object.entries(tagCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return { totalWorkouts, uniqueDays, longestStreak, firstWorkout, mostActiveDay, favoriteWorkout };
}

const tagEmojis: Record<string, string> = {
  gym: '🏋️',
  run: '🏃',
  walk: '🚶',
  yoga: '🧘',
  other: '⚡',
};

export default function TotalStats({ entries }: StatsProps) {
  const { totalWorkouts, uniqueDays, longestStreak, firstWorkout, mostActiveDay, favoriteWorkout } = computeAllTimeStats(entries);

  if (entries.length === 0) return null;

  const daysSinceStart = firstWorkout
    ? Math.ceil((Date.now() - firstWorkout.getTime()) / 86_400_000)
    : 0;
  const consistencyRate = daysSinceStart > 0 ? Math.round((uniqueDays / daysSinceStart) * 100) : 0;

  return (
    <section className="bg-white dark:bg-[#1a1728] rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700/50 mb-6 animate-fade-in">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
        All-Time Stats
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{totalWorkouts}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Workouts</p>
        </div>
        <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{uniqueDays}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active Days</p>
        </div>
        <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">🔥 {longestStreak}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Best Streak</p>
        </div>
        <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{consistencyRate}%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Consistency</p>
        </div>
      </div>
      
      {/* Additional insights row */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        {mostActiveDay && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{mostActiveDay}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Most Active Day</p>
          </div>
        )}
        {favoriteWorkout && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{tagEmojis[favoriteWorkout]} {favoriteWorkout.charAt(0).toUpperCase() + favoriteWorkout.slice(1)}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Favorite Workout</p>
          </div>
        )}
      </div>

      {firstWorkout && (
        <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-4">
          🏃 Journey started {firstWorkout.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      )}
    </section>
  );
}
