import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomNav } from "@/components/nav/bottom-nav";
import { ChatAgent } from "@/components/ChatAgent";
import { useStore } from "@/lib/nutritrack/store";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: AppShell,
});

function AppShell() {
  const { state } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.authLoading) return;
    if (!state.userId) navigate({ to: "/auth" });
    else if (!state.onboardingComplete) navigate({ to: "/onboarding" });
  }, [state.authLoading, state.userId, state.onboardingComplete, navigate]);

  if (state.authLoading || !state.userId || !state.onboardingComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background/40">
      <main className="flex-1 pb-2">
        <Outlet />
      </main>
      <BottomNav />
      <ChatAgent userId={state.userId} />
    </div>
  );
}
