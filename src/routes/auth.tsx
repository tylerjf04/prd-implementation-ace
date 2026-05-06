import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Flame, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Email is required");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");

    setLoading(true);
    try {
      if (tab === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.session) {
          // Email confirmation required
          toast.success("Check your email to confirm your account, then sign in.");
          setTab("login");
        } else {
          navigate({ to: "/onboarding" });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/app" });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-5 pb-10">
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-sunset text-primary-foreground shadow-glow">
          <Flame className="h-8 w-8" />
        </div>
        <div className="text-center">
          <h1 className="font-display text-3xl font-extrabold">NutriTrack</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track macros. Build streaks. Share the grind.
          </p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="mb-6 grid w-full grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
        {(["signup", "login"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-xl py-2.5 text-sm font-semibold transition",
              tab === t ? "bg-card text-foreground shadow-soft" : "text-muted-foreground",
            )}
          >
            {t === "signup" ? "Create account" : "Sign in"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-3">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="input pl-11"
            autoComplete="email"
            required
          />
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={tab === "signup" ? "Create a password (6+ chars)" : "Password"}
            className="input pl-11 pr-11"
            autoComplete={tab === "signup" ? "new-password" : "current-password"}
            required
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-sunset py-4 font-semibold text-primary-foreground shadow-glow transition disabled:opacity-60 active:scale-[0.98]"
        >
          {loading
            ? "Please wait…"
            : tab === "signup"
              ? "Create account"
              : "Sign in"}
          {!loading && <ArrowRight className="h-5 w-5" />}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {tab === "signup"
          ? "Your biometric data is never shared with third parties."
          : "Don't have an account? Switch to Create account above."}
      </p>
    </div>
  );
}
