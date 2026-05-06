import { Link, useRouterState } from "@tanstack/react-router";
import { Home, PlusCircle, Compass, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/app", icon: Home, label: "Home" },
  { to: "/app/feed", icon: Compass, label: "Feed" },
  { to: "/app/log", icon: PlusCircle, label: "Log", primary: true },
  { to: "/app/messages", icon: MessageCircle, label: "Inbox" },
  { to: "/app/profile", icon: User, label: "You" },
] as const;

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="sticky bottom-0 z-40 border-t border-border/60 bg-card/85 backdrop-blur-xl">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {items.map((it) => {
          const active = path === it.to || (it.to !== "/app" && path.startsWith(it.to));
          const Icon = it.icon;
          if (it.primary) {
            return (
              <li key={it.to}>
                <Link
                  to={it.to}
                  className="-mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-sunset text-primary-foreground shadow-glow ring-4 ring-background transition-transform active:scale-95"
                  aria-label={it.label}
                >
                  <Icon className="h-7 w-7" strokeWidth={2.5} />
                </Link>
              </li>
            );
          }
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_oklch(0.7_0.22_35/0.5)]")} />
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
