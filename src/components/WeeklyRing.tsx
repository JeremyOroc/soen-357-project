interface WeeklyRingProps {
  /** Array of ISO date strings (YYYY-MM-DD) that have been logged */
  loggedDays: string[];
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getWeekDates(): string[] {
  const today = new Date();
  const dow = today.getDay(); // 0 = Sunday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - dow + i);
    return d.toISOString().slice(0, 10);
  });
}

// SVG ring: circumference
const R = 54;
const C = 2 * Math.PI * R;

export default function WeeklyRing({ loggedDays }: WeeklyRingProps) {
  const week = getWeekDates();
  const loggedSet = new Set(loggedDays);
  const count = week.filter(d => loggedSet.has(d)).length;
  const pct = count / 7;
  const dash = C * pct;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* SVG Ring */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          {/* Track */}
          <circle
            cx="64" cy="64" r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-200 dark:text-slate-700"
          />
          {/* Progress */}
          <circle
            cx="64" cy="64" r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${C}`}
            className="text-brand-500 transition-all duration-700 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{count}/7</span>
          <span className="text-xs text-slate-400 mt-0.5">this week</span>
        </div>
      </div>

      {/* Day dots */}
      <div className="flex gap-3">
        {week.map((date, i) => {
          const logged = loggedSet.has(date);
          const isToday = date === new Date().toISOString().slice(0, 10);
          return (
            <div key={date} className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
                  ${logged
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}
                  ${isToday && !logged ? 'ring-2 ring-brand-400 ring-offset-1 dark:ring-offset-[#0f0d1a]' : ''}`}
              >
                {logged ? '✓' : DAY_LABELS[i]}
              </div>
              <span className={`text-[10px] font-medium ${isToday ? 'text-brand-500' : 'text-slate-400'}`}>
                {DAY_LABELS[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
