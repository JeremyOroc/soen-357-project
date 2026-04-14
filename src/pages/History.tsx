import type { WorkoutEntry } from '../types';
import TotalStats from '../components/TotalStats';

interface HistoryProps {
  entries: WorkoutEntry[];
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function groupByDate(entries: WorkoutEntry[]): Record<string, WorkoutEntry[]> {
  return entries.reduce<Record<string, WorkoutEntry[]>>((acc, e) => {
    const key = new Date(e.timestamp).toISOString().slice(0, 10);
    (acc[key] ??= []).push(e);
    return acc;
  }, {});
}

export default function History({ entries }: HistoryProps) {
  const grouped = groupByDate(entries);
  const sortedDays = Object.keys(grouped).sort().reverse();

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Workout History</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {entries.length === 0 ? 'No workouts logged yet. Go crush it!' : `${entries.length} workout${entries.length !== 1 ? 's' : ''} logged in total.`}
        </p>
      </div>

      <TotalStats entries={entries} />

      {sortedDays.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-slate-400">
          <span className="text-5xl">🏃</span>
          <p className="text-sm">Your workouts will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sortedDays.map(day => (
            <div key={day} className="bg-white dark:bg-[#1a1728] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                {formatDate(grouped[day][0].timestamp)}
              </p>
              <div className="flex flex-col gap-2">
                {grouped[day].map(e => (
                  <div key={e.id} className="flex items-center gap-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-3 py-2">
                    <span className="text-brand-500 text-lg">✓</span>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{e.label}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{formatTime(e.timestamp)}</p>
                    </div>
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
