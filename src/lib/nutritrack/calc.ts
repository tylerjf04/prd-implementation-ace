import type { Profile, MacroPlan, Activity, Goal } from "./types";

const ACTIVITY_MULT: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
};

const GOAL_DELTA: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

const SPLIT: Record<Goal, { p: number; c: number; f: number }> = {
  lose: { p: 0.35, c: 0.4, f: 0.25 },
  maintain: { p: 0.3, c: 0.45, f: 0.25 },
  gain: { p: 0.3, c: 0.5, f: 0.2 },
};

export function generatePlan(p: Profile): MacroPlan {
  const bmr =
    p.sex === "male"
      ? 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + 5
      : 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age - 161;
  const tdee = bmr * ACTIVITY_MULT[p.activity];
  const calories = Math.round(tdee + GOAL_DELTA[p.goal]);

  const split = SPLIT[p.goal];
  let proteinG = Math.max(Math.round((calories * split.p) / 4), Math.round(p.weightKg * 1.6));
  const proteinKcal = proteinG * 4;
  const remaining = calories - proteinKcal;
  const carbRatio = split.c / (split.c + split.f);
  const carbsG = Math.round((remaining * carbRatio) / 4);
  const fatG = Math.round((remaining * (1 - carbRatio)) / 9);
  const fiberG = p.sex === "male" ? 38 : 25;

  return { calories, proteinG, carbsG, fatG, fiberG };
}

export function kgToLbs(kg: number) { return kg * 2.20462; }
export function lbsToKg(lbs: number) { return lbs / 2.20462; }
export function cmToFtIn(cm: number) {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round(totalIn - ft * 12);
  return { ft, inch };
}
export function ftInToCm(ft: number, inch: number) { return (ft * 12 + inch) * 2.54; }

export function bmi(weightKg: number, heightCm: number) {
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
