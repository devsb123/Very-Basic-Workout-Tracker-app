import { useEffect, useState } from "react";
import { api } from "./api";

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 placeholder:text-zinc-500";

export default function SetsTab({ tab }) {
  const [sets, setSets] = useState([]);
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setSets(await api.getSets(tab));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!exercise.trim()) {
      setError("Exercise name is required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.addSet({
        tab,
        exercise: exercise.trim(),
        weight: weight === "" ? null : Number(weight),
        reps: reps === "" ? null : Number(reps),
      });
      setExercise("");
      setWeight("");
      setReps("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteSet(id);
      setSets((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-[2fr_1fr_1fr_auto]"
      >
        <input
          className={inputClass}
          placeholder="Exercise"
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
        />
        <input
          className={inputClass}
          type="number"
          min="0"
          step="0.5"
          placeholder="Weight"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <input
          className={inputClass}
          type="number"
          min="0"
          placeholder="Reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
        >
          {submitting ? "..." : "Log Set"}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-rose-400">{error}</p>}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading...</p>
      ) : sets.length === 0 ? (
        <p className="text-sm text-zinc-500">No sets logged yet.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900/60 text-xs uppercase tracking-wide text-zinc-400">
              <tr>
                <th className="px-4 py-3 font-medium">Exercise</th>
                <th className="px-4 py-3 font-medium">Weight</th>
                <th className="px-4 py-3 font-medium">Reps</th>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {sets.map((s) => (
                <tr key={s.id} className="text-zinc-200">
                  <td className="px-4 py-3 font-medium">{s.exercise}</td>
                  <td className="px-4 py-3">{s.weight ?? "-"}</td>
                  <td className="px-4 py-3">{s.reps ?? "-"}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(s.logged_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
