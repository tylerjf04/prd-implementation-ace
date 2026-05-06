import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Flame, TrendingDown, Scale, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/nutritrack/store";
import { generatePlan, ftInToCm, lbsToKg } from "@/lib/nutritrack/calc";
import type { Activity, Goal, Profile, Sex, Units } from "@/lib/nutritrack/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

const GOALS: { v: Goal; label: string; desc: string; icon: React.ReactNode }[] = [
  { v: "lose", label: "Lose weight", desc: "−500 kcal/day · ~0.5 kg/week", icon: <TrendingDown className="h-6 w-6" /> },
  { v: "maintain", label: "Maintain", desc: "Recomp at maintenance", icon: <Scale className="h-6 w-6" /> },
  { v: "gain", label: "Gain weight", desc: "+300 kcal/day · ~0.25 kg/week", icon: <TrendingUp className="h-6 w-6" /> },
];

const ACTIVITIES: { v: Activity; label: string; desc: string }[] = [
  { v: "sedentary", label: "Sedentary", desc: "Desk job, little exercise" },
  { v: "light", label: "Lightly active", desc: "1–3 workouts a week" },
  { v: "moderate", label: "Moderately active", desc: "3–5 workouts a week" },
  { v: "very", label: "Very active", desc: "6+ workouts or physical job" },
];

function Onboarding() {
  const { completeOnboarding } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // form
  const [units, setUnits] = useState<Units>("metric");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState(28);
  const [sex, setSex] = useState<Sex>("female");
  const [heightCm, setHeightCm] = useState(170);
  const [ft, setFt] = useState(5);
  const [inch, setInch] = useState(7);
  const [weightKg, setWeightKg] = useState(70);
  const [weightLbs, setWeightLbs] = useState(154);
  const [goal, setGoal] = useState<Goal>("lose");
  const [activity, setActivity] = useState<Activity>("moderate");
  const [targetWeightKg, setTargetWeightKg] = useState<number | undefined>(undefined);

  const finalHeight = units === "metric" ? heightCm : ftInToCm(ft, inch);
  const finalWeight = units === "metric" ? weightKg : lbsToKg(weightLbs);

  const draftProfile: Profile = {
    name: name || "Friend",
    username: username || "you",
    age, sex, heightCm: finalHeight, weightKg: finalWeight,
    goal, activity, targetWeightKg,
    units, createdAt: new Date().toISOString(),
  };
  const previewPlan = generatePlan(draftProfile);

  const steps = [
    "Welcome", "About you", "Body", "Goal", "Activity", "Your plan",
  ];

  const next = () => {
    if (step === 1 && !name.trim()) return toast.error("Tell us your name");
    if (step === 1 && !username.trim()) return toast.error("Pick a handle");
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = () => {
    completeOnboarding(draftProfile);
    toast.success("Plan locked in. Let's go 🔥");
    navigate({ to: "/app" });
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-10 pt-8">
      {/* progress */}
      <div className="mb-8 flex items-center gap-2">
        {step > 0 ? (
          <button onClick={back} className="rounded-full p-1.5 hover:bg-accent" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="w-8" />
        )}
        <div className="flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-sunset transition-all"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
        <span className="text-xs font-medium text-muted-foreground">{step + 1}/{steps.length}</span>
      </div>

      <div className="flex-1">
        {step === 0 && (
          <div className="flex h-full flex-col justify-center text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-sunset text-primary-foreground shadow-glow">
              <Flame className="h-10 w-10" />
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight">Hey 👋</h1>
            <p className="mt-3 text-muted-foreground">
              Three minutes to a personalized plan you'll actually follow. Let's build it.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-extrabold">First, the basics</h1>
            <Field label="Your name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Maya Chen"
                className="input"
              />
            </Field>
            <Field label="Pick a handle">
              <div className="flex items-center rounded-2xl border border-input bg-card pl-3">
                <span className="text-muted-foreground">@</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="mayalifts"
                  className="input border-0 bg-transparent pl-1"
                />
              </div>
            </Field>
            <Field label="Units">
              <div className="grid grid-cols-2 gap-2">
                <ToggleChip active={units === "metric"} onClick={() => setUnits("metric")}>Metric (kg, cm)</ToggleChip>
                <ToggleChip active={units === "imperial"} onClick={() => setUnits("imperial")}>Imperial (lb, ft)</ToggleChip>
              </div>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-extrabold">A bit about your body</h1>
            <p className="text-sm text-muted-foreground">Used only to calculate your plan. Editable anytime.</p>

            <Field label="Biological sex">
              <div className="grid grid-cols-2 gap-2">
                <ToggleChip active={sex === "female"} onClick={() => setSex("female")}>Female</ToggleChip>
                <ToggleChip active={sex === "male"} onClick={() => setSex("male")}>Male</ToggleChip>
              </div>
            </Field>

            <Field label="Age">
              <input
                type="number" min={13} max={100}
                value={age} onChange={(e) => setAge(+e.target.value || 0)}
                className="input"
              />
            </Field>

            {units === "metric" ? (
              <Field label="Height (cm)">
                <input type="number" min={100} max={250} value={heightCm}
                  onChange={(e) => setHeightCm(+e.target.value || 0)} className="input" />
              </Field>
            ) : (
              <Field label="Height">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center rounded-2xl border border-input bg-card pr-3">
                    <input type="number" min={3} max={8} value={ft}
                      onChange={(e) => setFt(+e.target.value || 0)} className="input border-0 bg-transparent" />
                    <span className="text-muted-foreground">ft</span>
                  </div>
                  <div className="flex items-center rounded-2xl border border-input bg-card pr-3">
                    <input type="number" min={0} max={11} value={inch}
                      onChange={(e) => setInch(+e.target.value || 0)} className="input border-0 bg-transparent" />
                    <span className="text-muted-foreground">in</span>
                  </div>
                </div>
              </Field>
            )}

            {units === "metric" ? (
              <Field label="Current weight (kg)">
                <input type="number" min={30} max={300} step="0.1" value={weightKg}
                  onChange={(e) => setWeightKg(+e.target.value || 0)} className="input" />
              </Field>
            ) : (
              <Field label="Current weight (lb)">
                <input type="number" min={60} max={600} step="0.1" value={weightLbs}
                  onChange={(e) => setWeightLbs(+e.target.value || 0)} className="input" />
              </Field>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-extrabold">What's the goal?</h1>
            <div className="space-y-3">
              {GOALS.map((g) => (
                <button
                  key={g.v}
                  onClick={() => setGoal(g.v)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition",
                    goal === g.v ? "border-primary bg-primary/5 shadow-soft" : "border-border bg-card hover:border-foreground/20"
                  )}
                >
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    goal === g.v ? "bg-gradient-sunset text-primary-foreground" : "bg-muted text-foreground"
                  )}>{g.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{g.label}</div>
                    <div className="text-xs text-muted-foreground">{g.desc}</div>
                  </div>
                  {goal === g.v && <Check className="h-5 w-5 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h1 className="font-display text-3xl font-extrabold">How active are you?</h1>
            <div className="space-y-3">
              {ACTIVITIES.map((a) => (
                <button
                  key={a.v}
                  onClick={() => setActivity(a.v)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left transition",
                    activity === a.v ? "border-primary bg-primary/5" : "border-border bg-card"
                  )}
                >
                  <div className="flex-1">
                    <div className="font-semibold">{a.label}</div>
                    <div className="text-xs text-muted-foreground">{a.desc}</div>
                  </div>
                  {activity === a.v && <Check className="h-5 w-5 text-primary" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-primary">Your plan</p>
              <h1 className="font-display text-3xl font-extrabold">Hit these daily 👇</h1>
            </div>

            <div className="rounded-3xl bg-gradient-sunset p-6 text-primary-foreground shadow-glow">
              <p className="text-sm opacity-80">Daily calories</p>
              <p className="font-display text-6xl font-extrabold leading-none">{previewPlan.calories}</p>
              <p className="mt-1 text-sm opacity-80">kcal</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <MacroCard label="Protein" value={previewPlan.proteinG} color="bg-[oklch(0.68_0.21_30)]" />
              <MacroCard label="Carbs" value={previewPlan.carbsG} color="bg-[oklch(0.78_0.18_75)]" />
              <MacroCard label="Fat" value={previewPlan.fatG} color="bg-[oklch(0.7_0.17_145)]" />
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-sm font-semibold">Fiber goal</p>
              <p className="text-xs text-muted-foreground">{previewPlan.fiberG}g per day</p>
            </div>

            <p className="text-xs text-muted-foreground">
              Calculated with Mifflin-St Jeor + your activity level. You can override any macro
              later from your profile.
            </p>
          </div>
        )}
      </div>

      <div className="mt-8">
        {step < steps.length - 1 ? (
          <button
            onClick={next}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-sunset py-4 font-semibold text-primary-foreground shadow-glow transition active:scale-[0.98]"
          >
            Continue <ArrowRight className="h-5 w-5" />
          </button>
        ) : (
          <button
            onClick={finish}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-4 font-semibold text-background transition active:scale-[0.98]"
          >
            Start tracking <ArrowRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition",
        active ? "border-primary bg-primary/5 text-foreground" : "border-border bg-card text-muted-foreground"
      )}
    >
      {children}
    </button>
  );
}

function MacroCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <div className={cn("mx-auto mb-2 h-1.5 w-8 rounded-full", color)} />
      <p className="font-display text-2xl font-bold">{value}<span className="text-sm font-medium text-muted-foreground">g</span></p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
