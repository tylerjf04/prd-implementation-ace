import { supabase } from "@/lib/supabase";
import type { Profile, MacroPlan, MealEntry, WeightEntry } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

function rowToProfile(row: Row): Profile {
  return {
    name: row.display_name ?? "",
    username: row.username ?? "",
    bio: row.bio ?? undefined,
    age: row.age,
    sex: row.sex,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    goal: row.goal,
    activity: row.activity,
    targetWeightKg: row.target_weight_kg ?? undefined,
    targetDate: row.target_date ?? undefined,
    units: row.units ?? "imperial",
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

function rowToPlan(row: Row): MacroPlan {
  return {
    calories: row.calories,
    proteinG: row.protein_g,
    carbsG: row.carbs_g,
    fatG: row.fat_g,
    fiberG: row.fiber_g,
  };
}

function rowToMeal(row: Row): MealEntry {
  return {
    id: row.id,
    date: row.date,
    slot: row.slot,
    name: row.name,
    servings: row.servings,
    calories: row.calories,
    proteinG: row.protein_g,
    carbsG: row.carbs_g,
    fatG: row.fat_g,
    createdAt: row.created_at,
  };
}

function rowToWeight(row: Row): WeightEntry {
  return {
    id: row.id,
    date: row.date,
    weightKg: row.weight_kg,
  };
}

export async function loadUserData(userId: string) {
  const [profileRes, planRes, mealsRes, weightsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("nutrition_plans")
      .select("*")
      .eq("user_id", userId)
      .order("effective_from", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("meal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
    supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true }),
  ]);

  return {
    profile: profileRes.data ? rowToProfile(profileRes.data) : undefined,
    plan: planRes.data ? rowToPlan(planRes.data) : undefined,
    meals: (mealsRes.data ?? []).map(rowToMeal),
    weights: (weightsRes.data ?? []).map(rowToWeight),
  };
}

export async function saveProfile(userId: string, profile: Profile) {
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    username: profile.username,
    display_name: profile.name,
    bio: profile.bio ?? null,
    age: profile.age,
    sex: profile.sex,
    height_cm: profile.heightCm,
    weight_kg: profile.weightKg,
    goal: profile.goal,
    activity: profile.activity,
    target_weight_kg: profile.targetWeightKg ?? null,
    target_date: profile.targetDate ?? null,
    units: profile.units,
  });
  if (error) throw new Error(`saveProfile: ${error.message}`);
}

export async function savePlan(userId: string, plan: MacroPlan) {
  const { error } = await supabase.from("nutrition_plans").insert({
    user_id: userId,
    calories: plan.calories,
    protein_g: plan.proteinG,
    carbs_g: plan.carbsG,
    fat_g: plan.fatG,
    fiber_g: plan.fiberG,
    effective_from: new Date().toISOString().slice(0, 10),
  });
  if (error) throw new Error(`savePlan: ${error.message}`);
}

export async function insertMealEntry(userId: string, meal: MealEntry) {
  const { error } = await supabase.from("meal_entries").insert({
    id: meal.id,
    user_id: userId,
    date: meal.date,
    slot: meal.slot,
    name: meal.name,
    servings: meal.servings,
    calories: meal.calories,
    protein_g: meal.proteinG,
    carbs_g: meal.carbsG,
    fat_g: meal.fatG,
  });
  if (error) console.error(`[db] insertMealEntry: ${error.message}`);
}

export async function deleteMealEntry(id: string) {
  const { error } = await supabase.from("meal_entries").delete().eq("id", id);
  if (error) console.error(`[db] deleteMealEntry: ${error.message}`);
}

export async function upsertWeightLog(userId: string, weightKg: number, date: string) {
  const { error } = await supabase
    .from("weight_logs")
    .upsert({ user_id: userId, weight_kg: weightKg, date }, { onConflict: "user_id,date" });
  if (error) console.error(`[db] upsertWeightLog: ${error.message}`);
}

export async function updateProfileWeight(userId: string, weightKg: number) {
  const { error } = await supabase
    .from("profiles")
    .update({ weight_kg: weightKg })
    .eq("id", userId);
  if (error) console.error(`[db] updateProfileWeight: ${error.message}`);
}
