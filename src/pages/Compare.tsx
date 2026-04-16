// Traditional Tracker — the CONTROL CONDITION in our user study.
// Intentionally complex (exercise name, sets, reps, weight, notes)
// to contrast with the One-Tap Dashboard. Records session duration
// and total interaction count for comparison.
import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Toast from '../components/Toast';

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
  unit: 'kg' | 'lbs';
  notes: string;
}

interface CompareSession {
  id: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  interactionCount: number;
  exercises: Exercise[];
}

const STORAGE_KEY = 'kmf_study_compare';

function loadSessions(): CompareSession[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveSessions(sessions: CompareSession[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function createEmptyExercise(): Exercise {
  return {
    id: uuidv4(),
    name: '',
    sets: '',
    reps: '',
    weight: '',
    unit: 'lbs',
    notes: '',
  };
}

export default function Compare() {
  const [exercises, setExercises] = useState<Exercise[]>([createEmptyExercise()]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  // Study metrics — timer starts on mount, counts every click and keystroke
  const startTimeRef = useRef<number>(Date.now());
  const interactionCountRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = Date.now();
    interactionCountRef.current = 0;

    const handleClick = () => {
      interactionCountRef.current++;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Count meaningful keystrokes (not just modifier keys)
      if (!['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
        interactionCountRef.current++;
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function updateExercise(id: string, field: keyof Exercise, value: string) {
    setExercises(prev =>
      prev.map(ex => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  }

  function addExercise() {
    setExercises(prev => [...prev, createEmptyExercise()]);
  }

  function removeExercise(id: string) {
    if (exercises.length === 1) return; // Keep at least one
    setExercises(prev => prev.filter(ex => ex.id !== id));
  }

  // Saves the session metrics and all filled-in exercises to localStorage
  function handleSaveSession() {
    const endTime = Date.now();
    const session: CompareSession = {
      id: uuidv4(),
      startTime: new Date(startTimeRef.current).toISOString(),
      endTime: new Date(endTime).toISOString(),
      durationMs: endTime - startTimeRef.current,
      interactionCount: interactionCountRef.current,
      exercises: exercises.filter(ex => ex.name.trim() !== ''),
    };

    const sessions = loadSessions();
    sessions.push(session);
    saveSessions(sessions);

    // Reset for next session
    setExercises([createEmptyExercise()]);
    startTimeRef.current = Date.now();
    interactionCountRef.current = 0;

    const seconds = (session.durationMs / 1000).toFixed(1);
    setToastMsg(`Session saved! Time: ${seconds}s, Interactions: ${session.interactionCount}`);
    setToastVisible(true);
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-6">
      {/* Study Mode Banner */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-3 mb-6">
        <p className="text-xs text-amber-800 dark:text-amber-200 font-medium text-center">
          📊 Study Mode — This interface simulates a traditional fitness tracker
        </p>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Traditional Tracker</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Log your workout details below. Used for research comparison purposes.
        </p>
      </div>

      {/* Exercise Form - Intentionally complex/verbose */}
      <div className="space-y-4">
        {exercises.map((exercise, index) => (
          <div
            key={exercise.id}
            className="bg-white dark:bg-[#1a1728] rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 relative"
          >
            {/* Remove button */}
            {exercises.length > 1 && (
              <button
                onClick={() => removeExercise(exercise.id)}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                aria-label="Remove exercise"
              >
                ×
              </button>
            )}

            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-3">
              Exercise {index + 1}
            </p>

            {/* Exercise Name */}
            <div className="mb-3">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Exercise Name *
              </label>
              <input
                type="text"
                value={exercise.name}
                onChange={e => updateExercise(exercise.id, 'name', e.target.value)}
                placeholder="e.g., Bench Press, Squats, Deadlift..."
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            {/* Sets, Reps, Weight Row */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Sets
                </label>
                <input
                  type="number"
                  value={exercise.sets}
                  onChange={e => updateExercise(exercise.id, 'sets', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Reps
                </label>
                <input
                  type="number"
                  value={exercise.reps}
                  onChange={e => updateExercise(exercise.id, 'reps', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Weight
                </label>
                <input
                  type="number"
                  value={exercise.weight}
                  onChange={e => updateExercise(exercise.id, 'weight', e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
            </div>

            {/* Unit Toggle */}
            <div className="mb-3">
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Unit
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateExercise(exercise.id, 'unit', 'lbs')}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                    exercise.unit === 'lbs'
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  lbs
                </button>
                <button
                  onClick={() => updateExercise(exercise.id, 'unit', 'kg')}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                    exercise.unit === 'kg'
                      ? 'bg-brand-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  kg
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={exercise.notes}
                onChange={e => updateExercise(exercise.id, 'notes', e.target.value)}
                placeholder="How did this set feel? Any form notes..."
                rows={2}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add Exercise Button */}
      <button
        onClick={addExercise}
        className="w-full mt-4 py-3 text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800/50 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors"
      >
        + Add Another Exercise
      </button>

      {/* Save Session Button */}
      <button
        onClick={handleSaveSession}
        className="w-full mt-4 py-4 text-base font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/30 transition-all active:scale-[0.98]"
      >
        Save Workout Session
      </button>

      {/* Helper text */}
      <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-4">
        Fill in all your exercises, then tap "Save Workout Session" to complete.
      </p>

      <Toast message={toastMsg} visible={toastVisible} onHide={() => setToastVisible(false)} />
    </main>
  );
}
