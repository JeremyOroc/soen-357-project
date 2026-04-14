import { useMemo } from 'react';
import type { WorkoutEntry } from '../types';

interface HistoryProps {
  entries: WorkoutEntry[];
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function groupByDate(entries: WorkoutEntry[]): Record<string, WorkoutEntry[]> {
  return entries.reduce<Record<string, WorkoutEntry[]>>((acc, e) => {
    const key = new Date(e.timestamp).toISOString().slice(0, 10);
    (acc[key] ??= []).push(e);
    return acc;
  }, {});
}

function computeLongestStreak(entries: WorkoutEntry[]): number {
  if (entries.length === 0) return 0;
  const days = [...new Set(entries.map(e => new Date(e.timestamp).toISOString().slice(0, 10)))].sort();
  let longest = 1, current = 1;
  for (let i = 1; i < days.length; i++) {
    const a = new Date(days[i - 1]).getTime();
    const b = new Date(days[i]).getTime();
    if ((b - a) / 86_400_000 === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}

function exportCsv(entries: WorkoutEntry[]) {
  const header = 'Date,Time,Label,Tag';
  const rows = entries.map(e => {
    const d = new Date(e.timestamp);
    return [
      d.toISOString().slice(0, 10),
      d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      e.label,
      e.tag ?? '',
    ].join(',');
  });
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kmf-workouts.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function History({ entries }: HistoryProps) {
  const grouped = groupByDate(entries);
  const sortedDays = Object.keys(grouped).sort().reverse();

  const totalDays = useMemo(() => Object.keys(grouped).length, [grouped]);
  const longestStreak = useMemo(() => computeLongestStreak(entries), [entries]);
  const mostCommonTag = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    entries.forEach(e => { if (e.tag) tagCounts[e.tag] = (tagCounts[e.tag] ?? 0) + 1; });
    const tags = Object.entries(tagCounts);
    if (tags.length === 0) return null;
    return tags.sort((a, b) => b[1] - a[1])[0][0];
  }, [entries]);

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Workout History
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {entries.length === 0
              ? 'No workouts logged yet. Go crush it!'
              : `${entries.length} workout${entries.length !== 1 ? 's' : ''} logged in total.`}
          </p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={() => exportCsv(entries)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Export workouts as CSV"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
        )}
      </div>

      {/* Stats summary */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white dark:bg-[#1a1728] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-brand-500">{entries.length}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 text-center">Total Workouts</span>
          </div>
          <div className="bg-white dark:bg-[#1a1728] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-brand-500">{totalDays}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 text-center">Active Days</span>
          </div>
          <div className="bg-white dark:bg-[#1a1728] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-amber-500">{longestStreak}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 text-center">Best Streak</span>
          </div>
          {mostCommonTag && (
            <div className="col-span-3 bg-white dark:bg-[#1a1728] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Favourite Activity</span>
              <span className="px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-sm font-semibold">{mostCommonTag}</span>
            </div>
          )}
        </div>
      )}

      {sortedDays.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-slate-400">
          <span className="text-5xl">🏃</span>
          <p className="text-sm">Your workouts will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sortedDays.map(day => (
            <div
              key={day}
              className="bg-white dark:bg-[#1a1728] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                {formatDate(grouped[day][0].timestamp)}
              </p>
              <div className="flex flex-col gap-2">
                {grouped[day].map(e => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-3 py-2"
                  >
                    <span className="text-brand-500 text-lg">✓</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {e.tag ? `${e.label} · ${e.tag}` : e.label}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {formatTime(e.timestamp)}
                      </p>
                    </div>
                    {e.tag && (
                      <span className="px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 text-xs font-medium">
                        {e.tag}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

