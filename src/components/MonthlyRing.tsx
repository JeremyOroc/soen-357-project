// Smaller SVG ring showing what percentage of the current month has logged workouts
import { useMemo } from 'react';

export default function MonthlyRing({ loggedDays }: { loggedDays: string[] }) {
  // Count how many days this month have at least one log
  const stats = useMemo(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthPrefix = now.toISOString().slice(0, 7); // e.g. "2026-04"
    const count = loggedDays.filter(day => day.startsWith(monthPrefix)).length;
    
    return {
      percentage: Math.round((count / daysInMonth) * 100),
    };
  }, [loggedDays]);

  const radius = 35; 
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (stats.percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="80" height="80" className="transform -rotate-90">
        {/* Background Track - Updated to match WeeklyRing */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Progress Ring - Matches text-brand-500 */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-brand-500 transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center leading-none">
        {/* Updated text color for dark mode consistency */}
        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {stats.percentage}%
        </span>
      </div>
    </div>
  );
}