// SVG ring that fills based on how many days this week have a logged workout.
// Also shows individual day pills (S M T W T F S) with checkmarks for logged days.
import { useState, useEffect } from 'react';

interface WeeklyRingProps {
  loggedDays: string[];  // Array of "YYYY-MM-DD" date strings
  pulse?: boolean;       // Briefly animate the ring when a new workout is logged
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Returns an array of 7 date strings for the current Sun–Sat week
function getWeekDates(): string[] {
  const today = new Date();
  const dow = today.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - dow + i);
    return d.toISOString().slice(0, 10);
  });
}

// SVG circle geometry
const R = 54;
const C = 2 * Math.PI * R;

export default function WeeklyRing({ loggedDays, pulse = false }: WeeklyRingProps) {
  const week = getWeekDates();
  const loggedSet = new Set(loggedDays);
  const count = week.filter(d => loggedSet.has(d)).length;
  const targetDash = C * (count / 7);

  // Animate from 0 to target on mount / when count changes
  const [dash, setDash] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDash(targetDash), 50);
    return () => clearTimeout(timer);
  }, [targetDash]);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className={`relative w-36 h-36 ${pulse ? 'animate-ring-pulse' : ''}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={R} fill="none" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-slate-700" />
          <circle cx="64" cy="64" r={R} fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dash} ${C}`} className="text-brand-500 transition-all duration-700 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{count}/7</span>
          <span className="text-xs text-slate-400 mt-0.5">this week</span>
        </div>
      </div>
      <div className="flex gap-3">
        {week.map((date, i) => {
          const logged = loggedSet.has(date);
          const isToday = date === new Date().toISOString().slice(0, 10);
          return (
            <div key={date} className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${logged ? 'bg-brand-500 text-white shadow-md shadow-brand-500/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'} ${isToday && !logged ? 'ring-2 ring-brand-400 ring-offset-1 dark:ring-offset-[#0f0d1a]' : ''}`}>
                {logged ? '✓' : DAY_LABELS[i]}
              </div>
              <span className={`text-[10px] font-medium ${isToday ? 'text-brand-500' : 'text-slate-400'}`}>{DAY_LABELS[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
