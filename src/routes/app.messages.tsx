import { createFileRoute } from "@tanstack/react-router";
import { mockThreads, getUser } from "@/lib/nutritrack/mock";
import { useState } from "react";
import { ArrowLeft, Send, Camera, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/messages")({
  component: Inbox,
});

function Inbox() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [extra, setExtra] = useState<Record<string, { from: "me" | "them"; text: string }[]>>({});

  if (openId) {
    const t = mockThreads.find((x) => x.id === openId)!;
    const u = getUser(t.userId);
    const messages = [...t.messages, ...(extra[openId] ?? [])];
    return (
      <div className="flex h-[calc(100vh-72px)] flex-col">
        <header className="flex items-center gap-3 border-b border-border/60 bg-card/85 px-4 py-3 backdrop-blur">
          <button onClick={() => setOpenId(null)} className="rounded-full p-1.5 hover:bg-accent"><ArrowLeft className="h-5 w-5" /></button>
          <img src={u.avatar} className="h-10 w-10 rounded-full bg-muted" alt="" />
          <div className="flex-1">
            <p className="text-sm font-semibold">@{u.handle}</p>
            <p className="text-xs text-muted-foreground">🔥 {u.streak} day streak</p>
          </div>
        </header>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
          <div className="mx-auto mb-4 flex w-fit items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" /> End-to-end encrypted
          </div>
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.from === "me" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                m.from === "me" ? "bg-gradient-sunset text-primary-foreground rounded-br-sm" : "bg-card border border-border rounded-bl-sm"
              )}>
                {m.text}
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            setExtra((p) => ({ ...p, [openId]: [...(p[openId] ?? []), { from: "me", text: draft }] }));
            setDraft("");
            setTimeout(() => {
              setExtra((p) => ({ ...p, [openId]: [...(p[openId] ?? []), { from: "them", text: "💪" }] }));
            }, 900);
          }}
          className="flex items-center gap-2 border-t border-border/60 bg-card p-3"
        >
          <button type="button" className="rounded-full p-2 text-muted-foreground"><Camera className="h-5 w-5" /></button>
          <input
            value={draft} onChange={(e) => setDraft(e.target.value)}
            placeholder="Message…"
            className="input"
          />
          <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-sunset text-primary-foreground" aria-label="Send">
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="px-5 pb-6 pt-6">
      <h1 className="mb-5 font-display text-2xl font-extrabold">Inbox</h1>
      <ul className="space-y-1">
        {mockThreads.map((t) => {
          const u = getUser(t.userId);
          const last = t.messages[t.messages.length - 1];
          return (
            <li key={t.id}>
              <button onClick={() => setOpenId(t.id)} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition hover:bg-accent">
                <img src={u.avatar} className="h-12 w-12 rounded-full bg-muted" alt="" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between">
                    <p className="truncate text-sm font-semibold">@{u.handle}</p>
                    <span className="text-[10px] text-muted-foreground">{formatAgo(last.minutesAgo)}</span>
                  </div>
                  <p className={cn("truncate text-xs", t.unread ? "font-semibold text-foreground" : "text-muted-foreground")}>
                    {last.text}
                  </p>
                </div>
                {t.unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-sunset px-1.5 text-[10px] font-bold text-primary-foreground">
                    {t.unread}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        🔒 Mutual follow required to start a new thread
      </p>
    </div>
  );
}

function formatAgo(min: number) {
  if (min < 60) return `${min}m`;
  if (min < 60 * 24) return `${Math.floor(min / 60)}h`;
  return `${Math.floor(min / (60 * 24))}d`;
}
