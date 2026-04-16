// Manages workout entries — persists to localStorage, provides log and reset actions
import { useState, useCallback } from 'react';
import type { WorkoutEntry } from '../types';

const STORAGE_KEY = 'kmf_workouts';

// Read saved workouts from localStorage (returns empty array if corrupt/missing)
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

  // Creates a new workout entry with an optional tag (e.g. "gym", "run")
  const logWorkout = useCallback((tag?: string) => {
    const tagLabels: Record<string, string> = {
      gym: '🏋️ Gym',
      run: '🏃 Run',
      walk: '🚶 Walk',
      yoga: '🧘 Yoga',
      other: '⚡ Other',
    };
    
    const entry: WorkoutEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      label: tag ? tagLabels[tag] || 'Workout Logged' : 'Workout Logged',
      tag,
    };
    // Prepend new entry so newest is first, then persist
    setEntries(prev => {
      const next = [entry, ...prev];
      save(next);
      return next;
    });
    return entry;
  }, []);

  // Clears all workout data from memory and storage
  const resetWorkouts = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setEntries([]);
  }, []);

  return { entries, logWorkout, resetWorkouts };
}
