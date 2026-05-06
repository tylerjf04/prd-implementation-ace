import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { BottomNav } from "@/components/nav/bottom-nav";
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
    if (!state.onboardingComplete) navigate({ to: "/onboarding" });
  }, [state.onboardingComplete, navigate]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background/40">
      <main className="flex-1 pb-2">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
