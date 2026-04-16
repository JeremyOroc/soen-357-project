// History page — shows all past workouts grouped by date,
// all-time stats, and a CSV export button.
import { useState } from 'react';
import type { WorkoutEntry } from '../types';
import TotalStats from '../components/TotalStats';
import Toast from '../components/Toast';

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

// Bucket entries by their calendar date so we can render them in groups
function groupByDate(entries: WorkoutEntry[]): Record<string, WorkoutEntry[]> {
  return entries.reduce<Record<string, WorkoutEntry[]>>((acc, e) => {
    const key = new Date(e.timestamp).toISOString().slice(0, 10);
    (acc[key] ??= []).push(e);
    return acc;
  }, {});
}

// Generates and downloads a CSV file of all workout entries
function exportToCSV(entries: WorkoutEntry[]) {
  if (entries.length === 0) return;
  
  const headers = ['ID', 'Date', 'Time', 'Workout Type', 'Label'];
  const rows = entries.map(e => {
    const date = new Date(e.timestamp);
    return [
      e.id,
      date.toISOString().slice(0, 10),
      date.toTimeString().slice(0, 8),
      e.tag || 'general',
      e.label,
    ].map(field => `"${field}"`).join(',');
  });
  
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `kmf-export-${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function History({ entries }: HistoryProps) {
  const [toastVisible, setToastVisible] = useState(false);
  const grouped = groupByDate(entries);
  const sortedDays = Object.keys(grouped).sort().reverse();

  function handleExport() {
    exportToCSV(entries);
    setToastVisible(true);
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Workout History</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {entries.length === 0 ? 'No workouts logged yet. Go crush it!' : `${entries.length} workout${entries.length !== 1 ? 's' : ''} logged.`}
          </p>
        </div>
        
        {/* CSV export button */}
        {entries.length > 0 && (
          <button
            onClick={handleExport}
            aria-label="Export data as CSV"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
        )}
      </div>

      {/* All-Time Stats Summary */}
      <TotalStats entries={entries} />

      {/* Workout List */}
      {sortedDays.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-slate-400 animate-fade-in">
          <span className="text-5xl">🏃</span>
          <p className="text-sm">Your workouts will appear here.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Start by logging your first workout!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sortedDays.map((day, dayIndex) => (
            <div 
              key={day} 
              className="bg-white dark:bg-[#1a1728] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/50 animate-fade-in"
              style={{ animationDelay: `${dayIndex * 50}ms` }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
                {formatDate(grouped[day][0].timestamp)}
              </p>
              <div className="flex flex-col gap-2">
                {grouped[day].map(e => (
                  <div key={e.id} className="flex items-center gap-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl px-3 py-2">
                    <span className="text-brand-500 text-lg">✓</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{e.label}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{formatTime(e.timestamp)}</p>
                    </div>
                    {e.tag && (
                      <span className="text-xs px-2 py-1 bg-brand-100 dark:bg-brand-800/30 text-brand-600 dark:text-brand-300 rounded-full">
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

      <Toast message="Data exported successfully! 📊" visible={toastVisible} onHide={() => setToastVisible(false)} />
    </main>
  );
}
