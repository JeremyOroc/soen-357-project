interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-2xl px-4 py-2">
      <span className="text-2xl select-none">🔥</span>
      <div>
        <p className="text-xl font-bold text-amber-600 dark:text-amber-400 leading-none">
          {streak}
        </p>
        <p className="text-xs text-amber-500 dark:text-amber-500 mt-0.5">
          {streak === 1 ? 'day streak' : 'day streak'}
        </p>
      </div>
    </div>
  );
}
