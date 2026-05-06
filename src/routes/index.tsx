import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Flame, TrendingUp, Users, ChevronRight, Sparkles, Heart, MessageCircle } from "lucide-react";
import { useStore } from "@/lib/nutritrack/store";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { state } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.onboardingComplete) navigate({ to: "/app" });
  }, [state.onboardingComplete, navigate]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero */}
      <section className="relative px-5 pt-12 pb-20 sm:pt-20">
        <div className="mx-auto max-w-md sm:max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-3 py-1.5 text-xs font-semibold backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Macro plans + a feed that gets it
          </div>

          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
            Track macros.
            <br />
            <span className="text-gradient-sunset">Build streaks.</span>
            <br />
            Share the grind.
          </h1>

          <p className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
            NutriTrack auto-generates your daily calories and macros from your goal — then layers
            on a social feed built for the dieting and fitness community. Accountability you'll
            actually open the app for.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/onboarding"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-sunset px-7 py-4 text-base font-semibold text-primary-foreground shadow-glow transition active:scale-95"
            >
              Build my plan
              <ChevronRight className="h-5 w-5" />
            </Link>
            <Link
              to="/app/feed"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-7 py-4 text-base font-semibold text-foreground transition hover:bg-accent"
              onClick={(e) => {
                if (!state.onboardingComplete) {
                  e.preventDefault();
                  navigate({ to: "/onboarding" });
                }
              }}
            >
              Peek the feed
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            <Stat n="40%" l="D30 retention" />
            <Stat n="3 min" l="to first log" />
            <Stat n="1M+" l="foods indexed" />
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-gradient-flame opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 top-60 h-72 w-72 rounded-full bg-gradient-lime opacity-20 blur-3xl" />
      </section>

      {/* Feature trio */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-md sm:max-w-3xl">
          <h2 className="mb-10 font-display text-3xl font-bold sm:text-4xl">
            Built for people who actually want it to <span className="text-gradient-sunset">stick</span>.
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <Feature
              icon={<Sparkles className="h-6 w-6" />}
              title="Auto plan"
              body="Mifflin-St Jeor + your goal = personalized calories, protein, carbs, fat, fiber. No spreadsheets."
              gradient="bg-gradient-flame"
            />
            <Feature
              icon={<Flame className="h-6 w-6" />}
              title="Streak engine"
              body="Hit ±10% of your daily target to keep your fire alive. One grace day per month, no judgment."
              gradient="bg-gradient-sunset"
            />
            <Feature
              icon={<Users className="h-6 w-6" />}
              title="NutriGram"
              body="Progress photos, meal posts, milestone cards. The accountability layer trackers always missed."
              gradient="bg-gradient-lime"
            />
          </div>
        </div>
      </section>

      {/* Sample post mock */}
      <section className="px-5 py-12">
        <div className="mx-auto max-w-md">
          <div className="rounded-3xl border border-border/60 bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-gradient-sunset" />
              <div>
                <p className="text-sm font-semibold">@mayalifts</p>
                <p className="text-xs text-muted-foreground">🔥 47 day streak · 2h</p>
              </div>
            </div>
            <div className="mt-4 aspect-square overflow-hidden rounded-2xl bg-gradient-flame" />
            <p className="mt-4 text-sm">Bulk lunch hit different today 🥩 920 kcal · 62g protein</p>
            <div className="mt-3 flex items-center gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" /> 482</span>
              <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> 12</span>
              <span className="flex items-center gap-1.5 text-primary"><TrendingUp className="h-4 w-4" /> +12g protein vs goal</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 pt-8 text-center">
        <Link
          to="/onboarding"
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-4 text-base font-semibold text-background transition active:scale-95"
        >
          Start your 3-minute setup
          <ChevronRight className="h-5 w-5" />
        </Link>
        <p className="mt-4 text-xs text-muted-foreground">No card. No spam. Cancel anytime.</p>
      </section>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-bold sm:text-3xl">{n}</div>
      <div className="text-xs text-muted-foreground">{l}</div>
    </div>
  );
}

function Feature({ icon, title, body, gradient }: { icon: React.ReactNode; title: string; body: string; gradient: string }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-soft transition hover:shadow-glow">
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${gradient} text-primary-foreground`}>
        {icon}
      </div>
      <h3 className="font-display text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
