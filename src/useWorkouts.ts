import { useCallback, useEffect, useState } from "react";
import type { NewWorkout, Workout } from "./types";

const STORAGE_KEY = "workout-tracker.workouts.v1";

function load(): Workout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Workout[];
  } catch {
    return [];
  }
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>(() => load());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    } catch {
      // ignore write errors (e.g. storage full / disabled)
    }
  }, [workouts]);

  const addWorkout = useCallback((data: NewWorkout) => {
    const workout: Workout = {
      ...data,
      id: makeId(),
      createdAt: Date.now(),
    };
    setWorkouts((prev) => [workout, ...prev]);
  }, []);

  const deleteWorkout = useCallback((id: string) => {
    setWorkouts((prev) => prev.filter((w) => w.id !== id));
  }, []);

  return { workouts, addWorkout, deleteWorkout };
}
