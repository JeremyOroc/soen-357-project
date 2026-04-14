import { useState, useCallback } from 'react';
import type { WorkoutEntry } from '../types';

const STORAGE_KEY = 'kmf_workouts';

function load(): WorkoutEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function save(entries: WorkoutEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useWorkouts() {
  const [entries, setEntries] = useState<WorkoutEntry[]>(load);

  const logWorkout = useCallback((tag?: string) => {
    const entry: WorkoutEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      label: 'Workout Logged',
      tag,
    };
    setEntries(prev => {
      const next = [entry, ...prev];
      save(next);
      return next;
    });
    return entry;
  }, []);

  const resetWorkouts = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setEntries([]);
  }, []);

  return { entries, logWorkout, resetWorkouts };
}
