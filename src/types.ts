export interface Workout {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number;
  date: string;
  notes?: string;
  createdAt: number;
}

export type NewWorkout = Omit<Workout, "id" | "createdAt">;
