import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AppState, Profile, MealEntry, WeightEntry, MacroPlan } from "./types";
import { generatePlan, todayISO } from "./calc";

const KEY = "nutritrack:v1";

const initial: AppState = {
  meals: [],
  weights: [],
  onboardingComplete: false,
};

interface Ctx {
  state: AppState;
  completeOnboarding: (p: Profile) => void;
  updateProfile: (p: Partial<Profile>) => void;
  setPlan: (plan: MacroPlan) => void;
  addMeal: (m: Omit<MealEntry, "id" | "createdAt">) => void;
  removeMeal: (id: string) => void;
  addWeight: (kg: number, date?: string) => void;
  reset: () => void;
}

const StoreCtx = createContext<Ctx | null>(null);

function load(): AppState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    return { ...initial, ...JSON.parse(raw) };
  } catch {
    return initial;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const value: Ctx = {
    state,
    completeOnboarding: (profile) => {
      const plan = generatePlan(profile);
      setState((s) => ({
        ...s,
        profile,
        plan,
        onboardingComplete: true,
        weights:
          s.weights.length === 0
            ? [{ id: crypto.randomUUID(), date: todayISO(), weightKg: profile.weightKg }]
            : s.weights,
      }));
    },
    updateProfile: (p) =>
      setState((s) => {
        if (!s.profile) return s;
        const profile = { ...s.profile, ...p };
        return { ...s, profile, plan: generatePlan(profile) };
      }),
    setPlan: (plan) => setState((s) => ({ ...s, plan })),
    addMeal: (m) =>
      setState((s) => ({
        ...s,
        meals: [
          ...s.meals,
          { ...m, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
        ],
      })),
    removeMeal: (id) => setState((s) => ({ ...s, meals: s.meals.filter((x) => x.id !== id) })),
    addWeight: (weightKg, date) =>
      setState((s) => ({
        ...s,
        weights: [
          ...s.weights.filter((w) => w.date !== (date ?? todayISO())),
          { id: crypto.randomUUID(), date: date ?? todayISO(), weightKg },
        ].sort((a, b) => a.date.localeCompare(b.date)),
        profile: s.profile ? { ...s.profile, weightKg } : s.profile,
      })),
    reset: () => setState(initial),
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be inside StoreProvider");
  return c;
}

/** Compute streak from meals + plan (within ±10% of calorie target). */
export function computeStreak(meals: MealEntry[], targetKcal?: number) {
  if (!targetKcal) return 0;
  const byDay = new Map<string, number>();
  for (const m of meals) byDay.set(m.date, (byDay.get(m.date) ?? 0) + m.calories);
  const lo = targetKcal * 0.9;
  const hi = targetKcal * 1.1;
  let streak = 0;
  const d = new Date();
  // Walk backwards from today, allowing today to be incomplete (don't break)
  for (let i = 0; i < 365; i++) {
    const iso = d.toISOString().slice(0, 10);
    const cal = byDay.get(iso) ?? 0;
    const hit = cal >= lo && cal <= hi;
    if (i === 0 && !hit) {
      // today not yet hit — don't reset, just skip
    } else if (hit) {
      streak++;
    } else {
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
