import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, computeStreak } from "@/lib/nutritrack/store";
import { todayISO, kgToLbs } from "@/lib/nutritrack/calc";
import { Flame, Plus, ChevronRight, Trash2, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { state, removeMeal } = useStore();
  const [date, setDate] = useState(todayISO());
  const profile = state.profile;
  const plan = state.plan;
  if (!profile || !plan) return null;

  const todays = state.meals.filter((m) => m.date === date);
  const sum = todays.reduce(
    (a, m) => ({
      kcal: a.kcal + m.calories,
      p: a.p + m.proteinG,
      c: a.c + m.carbsG,
      f: a.f + m.fatG,
    }),
    { kcal: 0, p: 0, c: 0, f: 0 }
  );
  const remaining = plan.calories - sum.kcal;
  const ringPct = Math.min(100, (sum.kcal / plan.calories) * 100);

  const streak = useMemo(() => computeStreak(state.meals, plan.calories), [state.meals, plan.calories]);

  const slots: { key: "breakfast" | "lunch" | "dinner" | "snack"; label: string; emoji: string }[] = [
    { key: "breakfast", label: "Breakfast", emoji: "🌅" },
    { key: "lunch", label: "Lunch", emoji: "🥗" },
    { key: "dinner", label: "Dinner", emoji: "🍽️" },
    { key: "snack", label: "Snacks", emoji: "🍎" },
  ];

  return (
    <div className="px-5 pb-6 pt-6">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Hey, {profile.name.split(" ")[0]}</p>
          <h1 className="font-display text-3xl font-extrabold">Today</h1>
        </div>
        <Link
          to="/app/profile"
          className="flex items-center gap-1.5 rounded-full bg-gradient-flame px-3 py-1.5 text-sm font-bold text-primary-foreground shadow-soft"
        >
          <Flame className="h-4 w-4" /> {streak}
        </Link>
      </div>

      {/* Date strip */}
      <DateStrip date={date} onChange={setDate} />

      {/* Calorie ring card */}
      <div className="mt-5 rounded-3xl border border-border/60 bg-card p-6 shadow-soft">
        <div className="flex items-center gap-5">
          <CalorieRing pct={ringPct} consumed={sum.kcal} target={plan.calories} />
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Remaining</p>
            <p className="font-display text-3xl font-extrabold">
              {remaining >= 0 ? remaining : 0}
              <span className="ml-1 text-base text-muted-foreground">kcal</span>
            </p>
            {remaining < 0 && (
              <p className="mt-1 text-xs font-semibold text-destructive">
                +{Math.abs(remaining)} over target
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Goal: {plan.calories} kcal
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <MacroBar label="Protein" value={sum.p} target={plan.proteinG} color="oklch(0.68 0.21 30)" />
          <MacroBar label="Carbs" value={sum.c} target={plan.carbsG} color="oklch(0.78 0.18 75)" />
          <MacroBar label="Fat" value={sum.f} target={plan.fatG} color="oklch(0.7 0.17 145)" />
        </div>
      </div>

      {/* Quick row */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link to="/app/log" className="group rounded-2xl border border-border/60 bg-card p-4 shadow-soft transition active:scale-[0.98]">
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-sunset text-primary-foreground">
            <Plus className="h-5 w-5" />
          </div>
          <p className="font-semibold">Log a meal</p>
          <p className="text-xs text-muted-foreground">Search, scan, or quick-add</p>
        </Link>
        <Link to="/app/weight" className="group rounded-2xl border border-border/60 bg-card p-4 shadow-soft transition active:scale-[0.98]">
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-lime text-primary-foreground">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="font-semibold">{profile.units === "metric" ? `${profile.weightKg.toFixed(1)} kg` : `${kgToLbs(profile.weightKg).toFixed(1)} lb`}</p>
          <p className="text-xs text-muted-foreground">Tap to log weight</p>
        </Link>
      </div>

      {/* Meal slots */}
      <div className="mt-6 space-y-3">
        {slots.map((slot) => {
          const items = todays.filter((m) => m.slot === slot.key);
          const totalKcal = items.reduce((a, x) => a + x.calories, 0);
          return (
            <div key={slot.key} className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{slot.emoji}</span>
                  <div>
                    <p className="font-semibold">{slot.label}</p>
                    <p className="text-xs text-muted-foreground">{totalKcal} kcal</p>
                  </div>
                </div>
                <Link to="/app/log" search={{ slot: slot.key } as never} className="rounded-full p-1.5 hover:bg-accent">
                  <Plus className="h-5 w-5" />
                </Link>
              </div>
              {items.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {items.map((m) => (
                    <li key={m.id} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.calories} kcal · {m.proteinG}g P</p>
                      </div>
                      <button onClick={() => removeMeal(m.id)} className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Remove">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <Link to="/app/feed" className="mt-6 flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
        <div>
          <p className="font-semibold">See what your community is eating</p>
          <p className="text-xs text-muted-foreground">Fresh from NutriGram</p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </Link>
    </div>
  );
}

function CalorieRing({ pct, consumed, target }: { pct: number; consumed: number; target: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 110 110" className="h-full w-full -rotate-90">
        <circle cx="55" cy="55" r={r} stroke="oklch(0.92 0.02 70)" strokeWidth="10" fill="none" />
        <circle
          cx="55" cy="55" r={r}
          stroke="url(#grad)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s" }}
        />
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.2 50)" />
            <stop offset="100%" stopColor="oklch(0.55 0.22 340)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-2xl font-extrabold leading-none">{consumed}</p>
        <p className="text-[10px] text-muted-foreground">/ {target}</p>
      </div>
    </div>
  );
}

function MacroBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const pct = Math.min(100, (value / target) * 100);
  const over = value > target;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-semibold">{label}</span>
        <span className={`text-xs ${over ? "text-destructive font-bold" : "text-muted-foreground"}`}>
          {Math.round(value)}/{target}g
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: over ? "oklch(0.6 0.24 25)" : color }}
        />
      </div>
    </div>
  );
}

function DateStrip({ date, onChange }: { date: string; onChange: (d: string) => void }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d;
  });
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
      {days.map((d) => {
        const iso = d.toISOString().slice(0, 10);
        const active = iso === date;
        const isToday = iso === todayISO();
        return (
          <button
            key={iso}
            onClick={() => onChange(iso)}
            className={`flex min-w-[3rem] flex-col items-center rounded-2xl px-3 py-2 text-xs font-semibold transition ${
              active ? "bg-foreground text-background" : "bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            <span className="text-[10px] uppercase opacity-70">
              {d.toLocaleDateString(undefined, { weekday: "short" })}
            </span>
            <span className="mt-0.5 text-base font-bold">{d.getDate()}</span>
            {isToday && <span className="mt-0.5 h-1 w-1 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}
