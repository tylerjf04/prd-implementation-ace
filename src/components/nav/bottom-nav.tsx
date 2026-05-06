import { Link, useRouterState } from "@tanstack/react-router";
import { Home, PlusCircle, Compass, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (p: string) => path === p || (p !== "/app" && path.startsWith(p));

  const tab = (to: "/app" | "/app/feed" | "/app/messages" | "/app/profile", Icon: typeof Home, label: string) => (
    <li key={to}>
      <Link
        to={to}
        className={cn(
          "flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
          isActive(to) ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </Link>
    </li>
  );

  return (
    <nav className="sticky bottom-0 z-40 border-t border-border/60 bg-card/85 backdrop-blur-xl">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {tab("/app", Home, "Home")}
        {tab("/app/feed", Compass, "Feed")}
        <li>
          <Link
            to="/app/log"
            className="-mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-sunset text-primary-foreground shadow-glow ring-4 ring-background transition-transform active:scale-95"
            aria-label="Log a meal"
          >
            <PlusCircle className="h-7 w-7" strokeWidth={2.5} />
          </Link>
        </li>
        {tab("/app/messages", MessageCircle, "Inbox")}
        {tab("/app/profile", User, "You")}
      </ul>
    </nav>
  );
}
