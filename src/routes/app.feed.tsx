import { createFileRoute } from "@tanstack/react-router";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { mockPosts, mockUsers, getUser, type MockPost } from "@/lib/nutritrack/mock";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/feed")({
  component: Feed,
});

function Feed() {
  const [tab, setTab] = useState<"following" | "discover">("following");
  return (
    <div className="pb-6">
      {/* sticky header */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 px-5 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-extrabold">
            <span className="text-gradient-sunset">Nutri</span>Gram
          </h1>
          <button className="rounded-full p-2 hover:bg-accent" aria-label="Send"><Send className="h-5 w-5" /></button>
        </div>
        <div className="mt-3 flex gap-1.5">
          {(["following", "discover"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-semibold capitalize",
                tab === t ? "bg-foreground text-background" : "text-muted-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {/* stories row */}
      <div className="flex gap-4 overflow-x-auto px-5 py-4 scrollbar-hide">
        {mockUsers.map((u) => (
          <div key={u.id} className="flex w-16 shrink-0 flex-col items-center gap-1">
            <div className="rounded-full bg-gradient-sunset p-0.5">
              <img src={u.avatar} className="h-14 w-14 rounded-full border-2 border-background bg-card" alt={u.name} />
            </div>
            <span className="truncate text-[11px] text-muted-foreground">@{u.handle}</span>
          </div>
        ))}
      </div>

      {/* feed */}
      <div className="space-y-6">
        {mockPosts.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: MockPost }) {
  const u = getUser(post.userId);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  return (
    <article className="bg-card">
      <div className="flex items-center gap-3 px-4 py-3">
        <img src={u.avatar} className="h-10 w-10 rounded-full bg-muted" alt={u.name} />
        <div className="flex-1">
          <p className="text-sm font-semibold">@{u.handle}</p>
          <p className="text-xs text-muted-foreground">{post.tag ?? `🔥 ${u.streak} day streak`}</p>
        </div>
        <button className="rounded-full p-1.5"><MoreHorizontal className="h-5 w-5" /></button>
      </div>

      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <img src={post.image} alt="" className="h-full w-full object-cover" loading="lazy" />
        {post.macros && (
          <div className="absolute bottom-3 left-3 rounded-full bg-background/85 px-3 py-1 text-xs font-bold backdrop-blur">
            🔥 {post.macros.kcal} kcal · {post.macros.p}g P
          </div>
        )}
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center gap-4">
          <button onClick={() => { setLiked(!liked); setLikes((n) => liked ? n - 1 : n + 1); }} className="transition active:scale-90">
            <Heart className={cn("h-7 w-7", liked && "fill-[oklch(0.6_0.24_25)] text-[oklch(0.6_0.24_25)]")} />
          </button>
          <button><MessageCircle className="h-7 w-7" /></button>
          <button><Send className="h-7 w-7" /></button>
          <button className="ml-auto"><Bookmark className="h-7 w-7" /></button>
        </div>
        <p className="mt-2 text-sm font-bold">{likes.toLocaleString()} likes</p>
        <p className="mt-1 text-sm">
          <span className="font-semibold">@{u.handle}</span>{" "}
          <span dangerouslySetInnerHTML={{ __html: post.caption.replace(/(#\w+)/g, '<span class="text-primary">$1</span>') }} />
        </p>
        {post.comments.length > 0 && (
          <button className="mt-1 text-xs text-muted-foreground">View all {post.comments.length} comments</button>
        )}
        <p className="mt-1 text-[11px] uppercase text-muted-foreground">{post.hoursAgo}h ago</p>
      </div>
    </article>
  );
}
