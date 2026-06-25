import { useState, type FormEvent } from "react";
import type { NewWorkout } from "../types";

interface Props {
  onAdd: (workout: NewWorkout) => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm = {
  exercise: "",
  sets: "3",
  reps: "10",
  weight: "0",
  date: today(),
  notes: "",
};

export function WorkoutForm({ onAdd }: Props) {
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const exercise = form.exercise.trim();
    if (!exercise) {
      setError("Please enter an exercise name.");
      return;
    }
    const sets = Math.max(0, Math.round(Number(form.sets) || 0));
    const reps = Math.max(0, Math.round(Number(form.reps) || 0));
    const weight = Math.max(0, Number(form.weight) || 0);

    onAdd({
      exercise,
      sets,
      reps,
      weight,
      date: form.date || today(),
      notes: form.notes.trim() || undefined,
    });

    setError(null);
    setForm({ ...emptyForm, date: form.date });
  }

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 placeholder:text-slate-500";
  const labelClass =
    "mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 shadow-xl shadow-black/20 backdrop-blur"
    >
      <h2 className="mb-4 text-base font-semibold text-slate-100">
        Log a workout
      </h2>

      <div className="mb-4">
        <label className={labelClass} htmlFor="exercise">
          Exercise
        </label>
        <input
          id="exercise"
          className={inputClass}
          placeholder="e.g. Bench Press"
          value={form.exercise}
          onChange={(e) => update("exercise", e.target.value)}
        />
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass} htmlFor="sets">
            Sets
          </label>
          <input
            id="sets"
            type="number"
            min={0}
            className={inputClass}
            value={form.sets}
            onChange={(e) => update("sets", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="reps">
            Reps
          </label>
          <input
            id="reps"
            type="number"
            min={0}
            className={inputClass}
            value={form.reps}
            onChange={(e) => update("reps", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="weight">
            Weight (kg)
          </label>
          <input
            id="weight"
            type="number"
            min={0}
            step="0.5"
            className={inputClass}
            value={form.weight}
            onChange={(e) => update("weight", e.target.value)}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className={labelClass} htmlFor="date">
          Date
        </label>
        <input
          id="date"
          type="date"
          className={inputClass}
          value={form.date}
          onChange={(e) => update("date", e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className={labelClass} htmlFor="notes">
          Notes <span className="normal-case text-slate-500">(optional)</span>
        </label>
        <input
          id="notes"
          className={inputClass}
          placeholder="How did it feel?"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>

      {error && (
        <p className="mb-3 text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 active:scale-[0.99]"
      >
        Add workout
      </button>
    </form>
  );
}
