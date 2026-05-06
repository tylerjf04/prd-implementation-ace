import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, computeStreak } from "@/lib/nutritrack/store";
import { Settings, Flame, Grid3x3, BarChart3, LogOut } from "lucide-react";
import { mockPosts } from "@/lib/nutritrack/mock";
import { kgToLbs } from "@/lib/nutritrack/calc";
import { useMemo } from "react";

export const Route = createFileRoute("/app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { state, reset } = useStore();
  const profile = state.profile!;
  const plan = state.plan!;
  const streak = useMemo(() => computeStreak(state.meals, plan.calories), [state.meals, plan.calories]);
  const startW = state.weights[0]?.weightKg ?? profile.weightKg;
  const change = profile.weightKg - startW;
  const unit = profile.units === "metric" ? "kg" : "lb";
  const conv = (kg: number) => (profile.units === "metric" ? kg : kgToLbs(kg));

  const goalTag = profile.goal === "lose" ? "🔽 Cutting" : profile.goal === "gain" ? "🔼 Bulking" : "⚖️ Maintaining";

  return (
    <div className="px-5 pb-10 pt-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold">@{profile.username}</h1>
        <button className="rounded-full p-2 hover:bg-accent" aria-label="Settings"><Settings className="h-5 w-5" /></button>
      </div>

      {/* top */}
      <div className="flex items-center gap-5">
        <div className="rounded-full bg-gradient-sunset p-1">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card font-display text-2xl font-extrabold">
            {profile.name.charAt(0)}
          </div>
        </div>
        <div className="flex flex-1 justify-around text-center">
          <Stat n={state.meals.length} l="logs" />
          <Stat n="128" l="followers" />
          <Stat n="241" l="following" />
        </div>
      </div>

      <div className="mt-3">
        <p className="font-semibold">{profile.name}</p>
        <p className="text-sm text-muted-foreground">{profile.bio || "Building better habits, one meal at a time."}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-gradient-flame px-3 py-1 text-xs font-bold text-primary-foreground">{goalTag}</span>
          <span className="flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs font-bold"><Flame className="h-3 w-3 text-primary" /> {streak} day streak</span>
        </div>
      </div>

      {/* plan card */}
      <div className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Daily plan</p>
          <Link to="/onboarding" className="text-xs font-semibold text-primary">Edit</Link>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <PlanStat label="kcal" v={plan.calories} />
          <PlanStat label="P" v={plan.proteinG} />
          <PlanStat label="C" v={plan.carbsG} />
          <PlanStat label="F" v={plan.fatG} />
        </div>
      </div>

      {/* progress */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Mini label="Current" v={`${conv(profile.weightKg).toFixed(1)} ${unit}`} />
        <Mini label="Start" v={`${conv(startW).toFixed(1)} ${unit}`} />
        <Mini label="Change" v={`${change >= 0 ? "+" : ""}${conv(change).toFixed(1)} ${unit}`} accent />
      </div>

      {/* tabs */}
      <div className="mt-6 flex border-b border-border">
        <button className="flex flex-1 items-center justify-center gap-2 border-b-2 border-foreground py-3 text-sm font-semibold">
          <Grid3x3 className="h-4 w-4" /> Posts
        </button>
        <Link to="/app/weight" className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold text-muted-foreground">
          <BarChart3 className="h-4 w-4" /> Progress
        </Link>
      </div>

      {/* photo grid (mock) */}
      <div className="mt-2 grid grid-cols-3 gap-0.5">
        {mockPosts.map((p) => (
          <div key={p.id} className="aspect-square overflow-hidden bg-muted">
            <img src={p.image} className="h-full w-full object-cover" alt="" loading="lazy" />
          </div>
        ))}
      </div>

      <button
        onClick={() => { if (confirm("Reset all NutriTrack data?")) reset(); }}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-destructive/30 py-3 text-sm font-semibold text-destructive"
      >
        <LogOut className="h-4 w-4" /> Reset demo data
      </button>
    </div>
  );
}

function Stat({ n, l }: { n: number | string; l: string }) {
  return <div><div className="font-display text-xl font-bold">{n}</div><div className="text-xs text-muted-foreground">{l}</div></div>;
}
function PlanStat({ label, v }: { label: string; v: number }) {
  return <div className="rounded-xl bg-muted p-2"><p className="font-display text-lg font-bold">{v}</p><p className="text-[10px] uppercase text-muted-foreground">{label}</p></div>;
}
function Mini({ label, v, accent }: { label: string; v: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border border-border p-3 text-center ${accent ? "bg-gradient-lime text-primary-foreground" : "bg-card"}`}>
      <p className="text-[10px] uppercase opacity-80">{label}</p>
      <p className="font-display text-base font-bold">{v}</p>
    </div>
  );
}
