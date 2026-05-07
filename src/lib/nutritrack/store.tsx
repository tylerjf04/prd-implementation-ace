import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { AppState, Profile, MealEntry, WeightEntry, MacroPlan } from "./types";
import { generatePlan, todayISO } from "./calc";
import { supabase } from "@/lib/supabase";
import {
  loadUserData,
  saveProfile,
  savePlan,
  insertMealEntry,
  deleteMealEntry,
  upsertWeightLog,
  updateProfileWeight,
} from "./db";

const initial: AppState = {
  meals: [],
  weights: [],
  onboardingComplete: false,
  userId: null,
  authLoading: true,
};

const CACHE_KEY = (uid: string) => `nt_data_${uid}`;

function readCache(uid: string): Partial<AppState> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY(uid));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeCache(uid: string, data: Pick<AppState, "profile" | "plan" | "meals" | "weights">) {
  try { localStorage.setItem(CACHE_KEY(uid), JSON.stringify(data)); } catch { /* storage full */ }
}

function clearCache(uid: string) {
  try { localStorage.removeItem(CACHE_KEY(uid)); } catch { /* ignore */ }
}

interface Ctx {
  state: AppState;
  completeOnboarding: (p: Profile) => Promise<void>;
  updateProfile: (p: Partial<Profile>) => void;
  setPlan: (plan: MacroPlan) => void;
  addMeal: (m: Omit<MealEntry, "id" | "createdAt">) => void;
  removeMeal: (id: string) => void;
  addWeight: (kg: number, date?: string) => void;
  signOut: () => Promise<void>;
  reset: () => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initial);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      userIdRef.current = uid;

      if (!uid) {
        setState({ ...initial, authLoading: false });
        return;
      }

      // Restore from cache immediately — no spinner on refresh
      const cached = readCache(uid);
      if (cached) {
        setState({
          userId: uid,
          authLoading: false,
          profile: cached.profile,
          plan: cached.plan,
          meals: cached.meals ?? [],
          weights: cached.weights ?? [],
          onboardingComplete: !!cached.profile,
        });
      } else {
        setState((s) => ({ ...s, userId: uid, authLoading: true }));
      }

      // Always refresh from Supabase in the background
      loadUserData(uid)
        .then((data) => {
          setState({
            userId: uid,
            authLoading: false,
            profile: data.profile,
            plan: data.plan,
            meals: data.meals,
            weights: data.weights,
            onboardingComplete: !!data.profile,
          });
          writeCache(uid, data);
        })
        .catch((err) => {
          console.error("[store] loadUserData:", err);
          setState((s) => ({ ...s, authLoading: false }));
        });
    });

    return () => subscription.unsubscribe();
  }, []);

  const value: Ctx = {
    state,

    completeOnboarding: async (profile) => {
      const uid = userIdRef.current;
      if (!uid) throw new Error("Not authenticated");

      const plan = generatePlan(profile);
      await Promise.all([
        saveProfile(uid, profile),
        savePlan(uid, plan),
        upsertWeightLog(uid, profile.weightKg, todayISO()),
      ]);

      const nextState = {
        userId: uid,
        authLoading: false,
        profile,
        plan,
        meals: [],
        weights: [{ id: crypto.randomUUID(), date: todayISO(), weightKg: profile.weightKg }],
        onboardingComplete: true,
      };
      setState(nextState);
      writeCache(uid, nextState);
    },

    updateProfile: (p) => {
      setState((s) => {
        if (!s.profile) return s;
        const profile = { ...s.profile, ...p };
        const plan = generatePlan(profile);
        const uid = userIdRef.current;
        if (uid) {
          saveProfile(uid, profile).catch(console.error);
          savePlan(uid, plan).catch(console.error);
        }
        return { ...s, profile, plan };
      });
    },

    setPlan: (plan) => {
      setState((s) => ({ ...s, plan }));
      const uid = userIdRef.current;
      if (uid) savePlan(uid, plan).catch(console.error);
    },

    addMeal: (m) => {
      const id = crypto.randomUUID();
      const entry: MealEntry = { ...m, id, createdAt: new Date().toISOString() };
      setState((s) => ({ ...s, meals: [...s.meals, entry] }));
      const uid = userIdRef.current;
      if (uid) insertMealEntry(uid, entry).catch(console.error);
    },

    removeMeal: (id) => {
      setState((s) => ({ ...s, meals: s.meals.filter((x) => x.id !== id) }));
      deleteMealEntry(id).catch(console.error);
    },

    addWeight: (weightKg, date) => {
      const d = date ?? todayISO();
      setState((s) => ({
        ...s,
        weights: [
          ...s.weights.filter((w) => w.date !== d),
          { id: crypto.randomUUID(), date: d, weightKg },
        ].sort((a, b) => a.date.localeCompare(b.date)),
        profile: s.profile ? { ...s.profile, weightKg } : s.profile,
      }));
      const uid = userIdRef.current;
      if (uid) {
        upsertWeightLog(uid, weightKg, d).catch(console.error);
        updateProfileWeight(uid, weightKg).catch(console.error);
      }
    },

    signOut: async () => {
      const uid = userIdRef.current;
      if (uid) clearCache(uid);
      await supabase.auth.signOut();
      userIdRef.current = null;
      setState({ ...initial, authLoading: false });
    },

    reset: () => {
      setState((s) => ({ ...initial, authLoading: false, userId: s.userId }));
    },
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be inside StoreProvider");
  return c;
}

/** Compute streak: consecutive days within ±10% of calorie target. */
export function computeStreak(meals: MealEntry[], targetKcal?: number) {
  if (!targetKcal) return 0;
  const byDay = new Map<string, number>();
  for (const m of meals) byDay.set(m.date, (byDay.get(m.date) ?? 0) + m.calories);
  const lo = targetKcal * 0.9;
  const hi = targetKcal * 1.1;
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const iso = d.toISOString().slice(0, 10);
    const cal = byDay.get(iso) ?? 0;
    const hit = cal >= lo && cal <= hi;
    if (i === 0 && !hit) {
      // today still in progress — don't break streak
    } else if (hit) {
      streak++;
    } else {
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}
