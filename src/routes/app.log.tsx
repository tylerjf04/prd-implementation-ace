import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Search, Zap, ScanLine, Plus } from "lucide-react";
import { useStore } from "@/lib/nutritrack/store";
import { todayISO } from "@/lib/nutritrack/calc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/log")({
  component: LogPage,
});

interface FoodItem { name: string; kcal: number; p: number; c: number; f: number; serving: string }

const FOOD_DB: FoodItem[] = [
  { name: "Grilled chicken breast", kcal: 165, p: 31, c: 0, f: 3.6, serving: "100 g" },
  { name: "Brown rice, cooked", kcal: 218, p: 4.5, c: 46, f: 1.6, serving: "1 cup" },
  { name: "Greek yogurt, plain 2%", kcal: 100, p: 17, c: 6, f: 2.5, serving: "170 g" },
  { name: "Avocado", kcal: 234, p: 2.9, c: 12.5, f: 21, serving: "1 medium" },
  { name: "Whole eggs", kcal: 78, p: 6, c: 0.6, f: 5, serving: "1 large" },
  { name: "Oats, dry", kcal: 150, p: 5, c: 27, f: 3, serving: "40 g" },
  { name: "Banana", kcal: 105, p: 1.3, c: 27, f: 0.4, serving: "1 medium" },
  { name: "Salmon, baked", kcal: 208, p: 22, c: 0, f: 13, serving: "100 g" },
  { name: "Sweet potato", kcal: 112, p: 2, c: 26, f: 0.1, serving: "1 medium" },
  { name: "Almonds", kcal: 164, p: 6, c: 6, f: 14, serving: "28 g (23 nuts)" },
  { name: "Cottage cheese, low-fat", kcal: 81, p: 14, c: 3, f: 1, serving: "100 g" },
  { name: "Olive oil", kcal: 119, p: 0, c: 0, f: 13.5, serving: "1 tbsp" },
  { name: "Black coffee", kcal: 2, p: 0.3, c: 0, f: 0, serving: "1 cup" },
  { name: "Whey protein", kcal: 120, p: 24, c: 3, f: 1.5, serving: "1 scoop" },
  { name: "Broccoli, steamed", kcal: 55, p: 3.7, c: 11, f: 0.6, serving: "1 cup" },
  { name: "Apple", kcal: 95, p: 0.5, c: 25, f: 0.3, serving: "1 medium" },
];

const SLOTS = ["breakfast", "lunch", "dinner", "snack"] as const;
type Slot = typeof SLOTS[number];

function LogPage() {
  const { addMeal } = useStore();
  const navigate = useNavigate();
  const [slot, setSlot] = useState<Slot>(currentSlot());
  const [tab, setTab] = useState<"search" | "quick">("search");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState(1);

  // Quick add
  const [qaName, setQaName] = useState("");
  const [qaKcal, setQaKcal] = useState(0);
  const [qaProtein, setQaProtein] = useState(0);

  const results = FOOD_DB.filter((f) => f.name.toLowerCase().includes(q.toLowerCase())).slice(0, 12);

  const submitFood = () => {
    if (!selected) return;
    addMeal({
      date: todayISO(), slot, name: selected.name, servings,
      calories: Math.round(selected.kcal * servings),
      proteinG: +(selected.p * servings).toFixed(1),
      carbsG: +(selected.c * servings).toFixed(1),
      fatG: +(selected.f * servings).toFixed(1),
    });
    toast.success(`Logged ${selected.name}`);
    navigate({ to: "/app" });
  };

  const submitQuick = () => {
    if (!qaName.trim() || !qaKcal) return toast.error("Name + calories required");
    addMeal({
      date: todayISO(), slot, name: qaName, servings: 1,
      calories: qaKcal, proteinG: qaProtein, carbsG: 0, fatG: 0,
    });
    toast.success("Logged 🔥");
    navigate({ to: "/app" });
  };

  return (
    <div className="px-5 pb-10 pt-6">
      <div className="mb-5 flex items-center gap-3">
        <Link to="/app" className="rounded-full p-1.5 hover:bg-accent" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl font-extrabold">Log food</h1>
      </div>

      {/* slot */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {SLOTS.map((s) => (
          <button
            key={s}
            onClick={() => setSlot(s)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold capitalize transition",
              slot === s ? "bg-foreground text-background" : "bg-card text-muted-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* tabs */}
      <div className="mb-4 grid grid-cols-2 gap-1.5 rounded-2xl bg-muted p-1">
        {(["search", "quick"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-xl py-2 text-sm font-semibold capitalize transition",
              tab === t ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
            )}
          >
            {t === "search" ? "Search foods" : "Quick add"}
          </button>
        ))}
      </div>

      {tab === "search" && !selected && (
        <>
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search 1M+ foods…"
              className="input pl-11"
            />
          </div>

          <div className="mb-3 flex gap-2">
            <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-muted-foreground">
              <ScanLine className="h-4 w-4" /> Scan barcode
            </button>
          </div>

          <ul className="space-y-2">
            {results.map((f) => (
              <li key={f.name}>
                <button
                  onClick={() => { setSelected(f); setServings(1); }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition hover:border-foreground/20"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-lime text-primary-foreground">
                    <Plus className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.serving} · {f.kcal} kcal · {f.p}g P</p>
                  </div>
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                No results. Try Quick add above.
              </li>
            )}
          </ul>
        </>
      )}

      {tab === "search" && selected && (
        <div className="space-y-5 rounded-3xl border border-border bg-card p-5 shadow-soft">
          <div>
            <p className="text-xs text-muted-foreground">Per {selected.serving}</p>
            <h2 className="font-display text-xl font-bold">{selected.name}</h2>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">Servings</label>
            <input
              type="number" min={0.25} step={0.25} value={servings}
              onChange={(e) => setServings(+e.target.value || 1)} className="input"
            />
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <Stat label="kcal" v={Math.round(selected.kcal * servings)} />
            <Stat label="P" v={+(selected.p * servings).toFixed(1)} />
            <Stat label="C" v={+(selected.c * servings).toFixed(1)} />
            <Stat label="F" v={+(selected.f * servings).toFixed(1)} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSelected(null)} className="flex-1 rounded-full border border-border bg-card py-3 font-semibold">Back</button>
            <button onClick={submitFood} className="flex-1 rounded-full bg-gradient-sunset py-3 font-semibold text-primary-foreground shadow-glow">
              Add to {slot}
            </button>
          </div>
        </div>
      )}

      {tab === "quick" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-primary">
              <Zap className="h-4 w-4" /> Just calories + protein, fast
            </div>
            <input value={qaName} onChange={(e) => setQaName(e.target.value)} placeholder="What did you eat?" className="input mb-3" />
            <div className="grid grid-cols-2 gap-2">
              <label>
                <span className="mb-1 block text-xs font-semibold text-muted-foreground">Calories</span>
                <input type="number" min={0} value={qaKcal || ""} onChange={(e) => setQaKcal(+e.target.value || 0)} className="input" />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold text-muted-foreground">Protein (g)</span>
                <input type="number" min={0} value={qaProtein || ""} onChange={(e) => setQaProtein(+e.target.value || 0)} className="input" />
              </label>
            </div>
          </div>
          <button onClick={submitQuick} className="w-full rounded-full bg-gradient-sunset py-3 font-semibold text-primary-foreground shadow-glow">
            Log it
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, v }: { label: string; v: number }) {
  return (
    <div className="rounded-xl bg-muted p-2">
      <p className="font-display text-lg font-bold">{v}</p>
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
    </div>
  );
}

function currentSlot(): Slot {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 21) return "dinner";
  return "snack";
}
