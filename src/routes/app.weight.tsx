import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useStore } from "@/lib/nutritrack/store";
import { kgToLbs, lbsToKg, todayISO, bmi } from "@/lib/nutritrack/calc";
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Area, AreaChart } from "recharts";

export const Route = createFileRoute("/app/weight")({
  component: WeightPage,
});

function WeightPage() {
  const { state, addWeight } = useStore();
  const profile = state.profile!;
  const [val, setVal] = useState<number>(
    profile.units === "metric" ? profile.weightKg : +kgToLbs(profile.weightKg).toFixed(1)
  );
  const [range, setRange] = useState<7 | 30 | 90 | 365>(30);

  const data = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - range);
    return state.weights
      .filter((w) => new Date(w.date) >= cutoff)
      .map((w) => ({
        date: w.date.slice(5),
        weight: profile.units === "metric" ? w.weightKg : +kgToLbs(w.weightKg).toFixed(1),
      }));
  }, [state.weights, range, profile.units]);

  const log = () => {
    const kg = profile.units === "metric" ? val : lbsToKg(val);
    addWeight(kg);
  };

  const startW = state.weights[0]?.weightKg ?? profile.weightKg;
  const change = profile.weightKg - startW;
  const unit = profile.units === "metric" ? "kg" : "lb";
  const display = (kg: number) => (profile.units === "metric" ? kg : kgToLbs(kg)).toFixed(1);

  const targetDisplay = profile.targetWeightKg
    ? +(profile.units === "metric" ? profile.targetWeightKg : kgToLbs(profile.targetWeightKg)).toFixed(1)
    : undefined;

  return (
    <div className="px-5 pb-10 pt-6">
      <div className="mb-5 flex items-center gap-3">
        <Link to="/app" className="rounded-full p-1.5 hover:bg-accent"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="font-display text-2xl font-extrabold">Weight</h1>
      </div>

      {/* Hero metric */}
      <div className="rounded-3xl bg-gradient-lime p-6 text-primary-foreground shadow-glow">
        <p className="text-xs uppercase opacity-80">Current</p>
        <p className="font-display text-5xl font-extrabold">{display(profile.weightKg)}<span className="ml-1 text-xl">{unit}</span></p>
        <div className="mt-3 flex gap-4 text-sm">
          <span>BMI {bmi(profile.weightKg, profile.heightCm).toFixed(1)}</span>
          <span>{change >= 0 ? "+" : ""}{display(profile.weightKg) - +display(startW) === 0 ? "0.0" : (profile.units === "metric" ? change : kgToLbs(change)).toFixed(1)} {unit}</span>
        </div>
      </div>

      {/* Quick log */}
      <div className="mt-4 flex gap-2">
        <input
          type="number" step={0.1} value={val}
          onChange={(e) => setVal(+e.target.value || 0)} className="input"
        />
        <button onClick={log} className="flex items-center gap-1.5 rounded-2xl bg-foreground px-5 font-semibold text-background">
          <Plus className="h-4 w-4" /> Log
        </button>
      </div>

      {/* range */}
      <div className="mt-4 flex gap-1.5">
        {[7, 30, 90, 365].map((r) => (
          <button key={r} onClick={() => setRange(r as 7)} className={`flex-1 rounded-full py-2 text-xs font-semibold ${range === r ? "bg-foreground text-background" : "bg-card text-muted-foreground"}`}>
            {r === 365 ? "1y" : `${r}d`}
          </button>
        ))}
      </div>

      {/* chart */}
      <div className="mt-3 rounded-3xl border border-border/60 bg-card p-3 shadow-soft">
        <div className="h-56 w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="wfill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.18 145)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.7 0.18 145)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="oklch(0.6 0.02 60)" />
                <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} stroke="oklch(0.6 0.02 60)" width={40} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid oklch(0.9 0.02 70)", fontSize: 12 }} />
                <Area type="monotone" dataKey="weight" stroke="oklch(0.55 0.18 150)" strokeWidth={2.5} fill="url(#wfill)" />
                {targetDisplay && <ReferenceLine y={targetDisplay} stroke="oklch(0.68 0.21 30)" strokeDasharray="4 4" label={{ value: `Goal ${targetDisplay}${unit}`, fontSize: 10, fill: "oklch(0.5 0.15 30)" }} />}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Log your first weight to see the graph come alive 📈
            </div>
          )}
        </div>
      </div>

      {/* history */}
      {state.weights.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">History</h3>
          <ul className="space-y-1.5">
            {[...state.weights].reverse().slice(0, 12).map((w) => (
              <li key={w.id} className="flex items-center justify-between rounded-xl bg-card p-3 text-sm">
                <span>{w.date}</span>
                <span className="font-semibold">{display(w.weightKg)} {unit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
