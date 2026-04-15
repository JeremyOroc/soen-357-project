import { useState, useMemo } from 'react';
import Toast from '../components/Toast';

/**
 * Study Data Page - Facilitator Only
 * 
 * HCI Purpose: This page displays all collected study metrics for analysis.
 * It is NOT linked in the navbar - only accessible via direct URL (/study-data).
 * 
 * Data Sources:
 * - kmf_study_dashboard: One-Tap logging sessions (time only)
 * - kmf_study_compare: Traditional tracker sessions (time + interactions)
 */

interface DashboardSession {
  id: string;
  startTime: string;
  endTime: string;
  durationMs: number;
}

interface CompareSession {
  id: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  interactionCount: number;
  exercises: unknown[];
}

interface CombinedSession {
  id: string;
  interface: 'One-Tap' | 'Traditional';
  date: string;
  time: string;
  durationSec: number;
  interactions: number | null;
}

function loadDashboardSessions(): DashboardSession[] {
  try {
    return JSON.parse(localStorage.getItem('kmf_study_dashboard') ?? '[]');
  } catch {
    return [];
  }
}

function loadCompareSessions(): CompareSession[] {
  try {
    return JSON.parse(localStorage.getItem('kmf_study_compare') ?? '[]');
  } catch {
    return [];
  }
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function exportToCSV(sessions: CombinedSession[]) {
  if (sessions.length === 0) return;

  const headers = ['Session #', 'Interface', 'Date', 'Time', 'Duration (sec)', 'Interactions'];
  const rows = sessions.map((s, i) => [
    i + 1,
    s.interface,
    s.date,
    s.time,
    s.durationSec.toFixed(1),
    s.interactions ?? 'N/A',
  ].map(field => `"${field}"`).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `kmf-study-data-${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function StudyData() {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const combinedSessions = useMemo<CombinedSession[]>(() => {
    const dashboardSessions = loadDashboardSessions().map(s => ({
      id: s.id,
      interface: 'One-Tap' as const,
      date: formatDate(s.startTime),
      time: formatTime(s.startTime),
      durationSec: s.durationMs / 1000,
      interactions: null,
    }));

    const compareSessions = loadCompareSessions().map(s => ({
      id: s.id,
      interface: 'Traditional' as const,
      date: formatDate(s.startTime),
      time: formatTime(s.startTime),
      durationSec: s.durationMs / 1000,
      interactions: s.interactionCount,
    }));

    return [...dashboardSessions, ...compareSessions].sort((a, b) => {
      // Sort by date descending
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, []);

  // Compute averages
  const stats = useMemo(() => {
    const oneTapSessions = combinedSessions.filter(s => s.interface === 'One-Tap');
    const traditionalSessions = combinedSessions.filter(s => s.interface === 'Traditional');

    const avgOneTap = oneTapSessions.length > 0
      ? oneTapSessions.reduce((sum, s) => sum + s.durationSec, 0) / oneTapSessions.length
      : 0;

    const avgTraditional = traditionalSessions.length > 0
      ? traditionalSessions.reduce((sum, s) => sum + s.durationSec, 0) / traditionalSessions.length
      : 0;

    const avgInteractions = traditionalSessions.length > 0
      ? traditionalSessions.reduce((sum, s) => sum + (s.interactions ?? 0), 0) / traditionalSessions.length
      : 0;

    return {
      oneTapCount: oneTapSessions.length,
      traditionalCount: traditionalSessions.length,
      avgOneTap,
      avgTraditional,
      avgInteractions,
    };
  }, [combinedSessions]);

  function handleClearAll() {
    if (!confirm('Are you sure you want to clear ALL study data? This cannot be undone.')) {
      return;
    }
    localStorage.removeItem('kmf_study_dashboard');
    localStorage.removeItem('kmf_study_compare');
    setToastMsg('All study data cleared');
    setToastVisible(true);
    // Force re-render
    window.location.reload();
  }

  function handleExport() {
    if (combinedSessions.length === 0) {
      setToastMsg('No data to export');
      setToastVisible(true);
      return;
    }
    exportToCSV(combinedSessions);
    setToastMsg('Data exported as CSV');
    setToastVisible(true);
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">📊 Study Data</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Facilitator view — Collected metrics from user study sessions
        </p>
      </div>

      {/* Summary Stats */}
      <section className="bg-white dark:bg-[#1a1728] rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 mb-6">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
          Summary Statistics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
              {stats.avgOneTap.toFixed(1)}s
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Avg One-Tap Time</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
              {stats.avgTraditional.toFixed(1)}s
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Avg Traditional Time</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
              {stats.avgInteractions.toFixed(0)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Avg Interactions</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.avgTraditional > 0 ? ((stats.avgTraditional / stats.avgOneTap) || 0).toFixed(1) : '—'}x
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Time Reduction</p>
          </div>
        </div>
        <div className="flex gap-4 mt-4 text-xs text-slate-500 dark:text-slate-400 justify-center">
          <span>One-Tap Sessions: {stats.oneTapCount}</span>
          <span>•</span>
          <span>Traditional Sessions: {stats.traditionalCount}</span>
        </div>
      </section>

      {/* Data Table */}
      <section className="bg-white dark:bg-[#1a1728] rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50 mb-6 overflow-x-auto">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">
          Session Log
        </h2>
        {combinedSessions.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm">No study sessions recorded yet.</p>
            <p className="text-xs mt-1">Use the Dashboard or Compare page to log sessions.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/50">
                <th className="text-left py-2 px-2 text-xs font-semibold text-slate-400 dark:text-slate-500">#</th>
                <th className="text-left py-2 px-2 text-xs font-semibold text-slate-400 dark:text-slate-500">Interface</th>
                <th className="text-left py-2 px-2 text-xs font-semibold text-slate-400 dark:text-slate-500">Date</th>
                <th className="text-left py-2 px-2 text-xs font-semibold text-slate-400 dark:text-slate-500">Time</th>
                <th className="text-right py-2 px-2 text-xs font-semibold text-slate-400 dark:text-slate-500">Duration</th>
                <th className="text-right py-2 px-2 text-xs font-semibold text-slate-400 dark:text-slate-500">Interactions</th>
              </tr>
            </thead>
            <tbody>
              {combinedSessions.map((session, index) => (
                <tr key={session.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                  <td className="py-2 px-2 text-slate-500 dark:text-slate-400">{index + 1}</td>
                  <td className="py-2 px-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      session.interface === 'One-Tap'
                        ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {session.interface}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-slate-700 dark:text-slate-300">{session.date}</td>
                  <td className="py-2 px-2 text-slate-500 dark:text-slate-400">{session.time}</td>
                  <td className="py-2 px-2 text-right font-mono text-slate-700 dark:text-slate-300">
                    {session.durationSec.toFixed(1)}s
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-slate-500 dark:text-slate-400">
                    {session.interactions ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleExport}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1a1728] border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export CSV
        </button>
        <button
          onClick={handleClearAll}
          className="flex-1 py-3 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
        >
          Clear All Data
        </button>
      </div>

      <Toast message={toastMsg} visible={toastVisible} onHide={() => setToastVisible(false)} />
    </main>
  );
}
