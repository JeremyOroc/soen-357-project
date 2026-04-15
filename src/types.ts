export interface WorkoutEntry {
  id: string;
  timestamp: number; // Unix ms
  label: string;     // e.g. "Workout Logged"
  tag?: string;      // Optional workout type: gym, run, walk, yoga, other
}
