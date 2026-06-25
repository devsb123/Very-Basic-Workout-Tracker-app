import type { Workout } from "../types";

interface Props {
  workouts: Workout[];
}

function startOfWeek(): number {
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - day);
  return monday.getTime();
}

export function Stats({ workouts }: Props) {
  const total = workouts.length;
  const weekStart = startOfWeek();
  const thisWeek = workouts.filter(
    (w) => new Date(w.date).getTime() >= weekStart
  ).length;
  const totalVolume = workouts.reduce(
    (sum, w) => sum + w.sets * w.reps * w.weight,
    0
  );

  const items = [
    { label: "Total workouts", value: total.toString() },
    { label: "This week", value: thisWeek.toString() },
    {
      label: "Total volume",
      value: `${Math.round(totalVolume).toLocaleString()} kg`,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-center"
        >
          <div className="text-2xl font-bold text-slate-100">{item.value}</div>
          <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
