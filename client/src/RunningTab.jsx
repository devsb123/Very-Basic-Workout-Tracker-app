import { useEffect, useState } from "react";
import { api } from "./api";

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 placeholder:text-zinc-500";

export default function RunningTab() {
  const [runs, setRuns] = useState([]);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setRuns(await api.getRuns());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.addRun({
        distance: distance === "" ? null : Number(distance),
        duration: duration === "" ? null : Number(duration),
      });
      setDistance("");
      setDuration("");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteRun(id);
      setRuns((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:grid-cols-[1fr_1fr_auto]"
      >
        <input
          className={inputClass}
          type="number"
          min="0"
          step="0.01"
          placeholder="Distance (miles)"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
        />
        <input
          className={inputClass}
          type="number"
          min="0"
          placeholder="Duration (minutes)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
        >
          {submitting ? "..." : "Log Run"}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-rose-400">{error}</p>}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading...</p>
      ) : runs.length === 0 ? (
        <p className="text-sm text-zinc-500">No runs logged yet.</p>
      ) : (
        <ul className="space-y-2">
          {runs.map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3"
            >
              <div className="flex items-baseline gap-4">
                <span className="text-base font-semibold text-zinc-100">
                  {r.distance ?? "-"} mi
                </span>
                <span className="text-sm text-zinc-400">
                  {r.duration ?? "-"} min
                </span>
                <span className="text-xs text-zinc-600">
                  {new Date(r.logged_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => handleDelete(r.id)}
                className="rounded-md px-2 py-1 text-xs font-medium text-rose-400 transition hover:bg-rose-500/10"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
