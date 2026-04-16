// Settings page — shows app info and a two-step data reset button
import { useState } from 'react';
import { ONBOARDING_KEY } from './Onboarding';

interface SettingsProps {
  onReset: () => void;
}

export default function Settings({ onReset }: SettingsProps) {
  const [confirming, setConfirming] = useState(false);

  // First click shows a confirmation prompt, second click actually resets
  function handleReset() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    localStorage.removeItem(ONBOARDING_KEY);
    onReset();
    setConfirming(false);
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Settings</h1>

      {/* About card */}
      <section className="bg-white dark:bg-[#1a1728] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          About
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-3xl">🏃</span>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">KeepMovingForward</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              A minimalist fitness habit tracker. One tap, every day.
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 pt-1">
          Your data is stored locally on your device — nothing leaves your browser.
        </p>
      </section>

      {/* Reset card */}
      <section className="bg-white dark:bg-[#1a1728] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Data
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Reset all your workout history and start fresh. This cannot be undone.
        </p>
        {confirming ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-red-500">
              Are you sure? All workout data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
              >
                Yes, reset everything
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleReset}
            className="py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-red-500 font-semibold text-sm transition-colors hover:bg-red-50 dark:hover:bg-slate-700"
          >
            Reset All Data
          </button>
        )}
      </section>
    </main>
  );
}
