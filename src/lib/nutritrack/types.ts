export type Goal = "lose" | "maintain" | "gain";
export type Activity = "sedentary" | "light" | "moderate" | "very";
export type Sex = "male" | "female";
export type Units = "metric" | "imperial";

export interface Profile {
  name: string;
  username: string;
  bio?: string;
  avatar?: string;
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  activity: Activity;
  targetWeightKg?: number;
  targetDate?: string;
  units: Units;
  createdAt: string;
}

export interface MacroPlan {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface MealEntry {
  id: string;
  date: string; // YYYY-MM-DD
  slot: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  servings: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  createdAt: string;
}

export interface WeightEntry {
  id: string;
  date: string;
  weightKg: number;
}

export interface AppState {
  profile?: Profile;
  plan?: MacroPlan;
  meals: MealEntry[];
  weights: WeightEntry[];
  onboardingComplete: boolean;
}
