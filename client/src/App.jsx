import { useState } from "react";
import SetsTab from "./SetsTab";
import RunningTab from "./RunningTab";

const TABS = [
  { id: "push", label: "Push" },
  { id: "pull", label: "Pull" },
  { id: "legs", label: "Legs" },
  { id: "running", label: "Running" },
];

export default function App() {
  const [active, setActive] = useState("push");

  return (
    <div className="min-h-full bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8 flex items-center gap-3">
          <img src="/dumbbell.svg" alt="" className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">IronLog</h1>
            <p className="text-sm text-zinc-500">
              Log your lifts and runs.
            </p>
          </div>
        </header>

        <nav className="mb-8 inline-flex rounded-xl border border-zinc-800 bg-zinc-900/40 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                active === tab.id
                  ? "bg-indigo-500 text-white"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <main>
          {active === "running" ? (
            <RunningTab />
          ) : (
            <SetsTab key={active} tab={active} />
          )}
        </main>
      </div>
    </div>
  );
}
