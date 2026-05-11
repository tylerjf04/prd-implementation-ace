import { createFileRoute } from "@tanstack/react-router";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Plus, Camera, ImageIcon, X, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/nutritrack/store";
import { loadFeedPosts, toggleLike, createPost, timeAgo, type Post } from "@/lib/nutritrack/posts";
import type { Profile } from "@/lib/nutritrack/types";

export const Route = createFileRoute("/app/feed")({
  component: Feed,
});

const avatar = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`;

function Feed() {
  const { state } = useStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<"following" | "discover">("following");

  const fetchPosts = async () => {
    if (!state.userId) return;
    setLoading(true);
    try {
      const data = await loadFeedPosts(state.userId);
      setPosts(data);
    } catch (err) {
      console.error("[feed] load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [state.userId]);

  const handleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!state.userId) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likedByMe: !currentlyLiked, likesCount: currentlyLiked ? p.likesCount - 1 : p.likesCount + 1 }
          : p
      )
    );
    try {
      await toggleLike(postId, state.userId, currentlyLiked);
    } catch {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, likedByMe: currentlyLiked, likesCount: currentlyLiked ? p.likesCount + 1 : p.likesCount - 1 }
            : p
        )
      );
    }
  };

  const recentPosters = [...new Map(posts.map((p) => [p.userId, p])).values()].slice(0, 8);

  return (
    <div className="pb-6">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 px-5 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-extrabold">
            <span className="text-gradient-sunset">Nutri</span>Gram
          </h1>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-full bg-gradient-sunset px-3.5 py-1.5 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            <Plus className="h-4 w-4" /> Post
          </button>
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

      {recentPosters.length > 0 && (
        <div className="flex gap-4 overflow-x-auto px-5 py-4 scrollbar-hide">
          {recentPosters.map((p) => (
            <div key={p.userId} className="flex w-16 shrink-0 flex-col items-center gap-1">
              <div className="rounded-full bg-gradient-sunset p-0.5">
                <img src={avatar(p.authorUsername)} className="h-14 w-14 rounded-full border-2 border-background bg-card" alt={p.authorName} />
              </div>
              <span className="w-full truncate text-center text-[11px] text-muted-foreground">@{p.authorUsername}</span>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 px-5 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold">No posts yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Be the first to share your progress!</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-full bg-gradient-sunset px-6 py-3 font-semibold text-primary-foreground shadow-glow"
          >
            Create your first post
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} onLike={() => handleLike(p.id, p.likedByMe)} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreatePostSheet
          userId={state.userId!}
          profile={state.profile}
          onClose={() => setShowCreate(false)}
          onPosted={() => { setShowCreate(false); fetchPosts(); }}
        />
      )}
    </div>
  );
}

function PostCard({ post, onLike }: { post: Post; onLike: () => void }) {
  return (
    <article className="bg-card">
      <div className="flex items-center gap-3 px-4 py-3">
        <img src={avatar(post.authorUsername)} className="h-10 w-10 rounded-full bg-muted" alt={post.authorName} />
        <div className="flex-1">
          <p className="text-sm font-semibold">@{post.authorUsername}</p>
          <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
        </div>
        <button className="rounded-full p-1.5"><MoreHorizontal className="h-5 w-5" /></button>
      </div>

      {post.imageUrl && (
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <img src={post.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
          {(post.macrosKcal || post.macrosProtein) && (
            <div className="absolute bottom-3 left-3 rounded-full bg-background/85 px-3 py-1 text-xs font-bold backdrop-blur">
              {post.macrosKcal ? `🔥 ${post.macrosKcal} kcal` : ""}
              {post.macrosKcal && post.macrosProtein ? " · " : ""}
              {post.macrosProtein ? `${post.macrosProtein}g P` : ""}
            </div>
          )}
        </div>
      )}

      <div className="px-4 py-3">
        <div className="flex items-center gap-4">
          <button onClick={onLike} className="transition active:scale-90">
            <Heart className={cn("h-7 w-7", post.likedByMe && "fill-[oklch(0.6_0.24_25)] text-[oklch(0.6_0.24_25)]")} />
          </button>
          <button><MessageCircle className="h-7 w-7" /></button>
          <button><Send className="h-7 w-7" /></button>
          <button className="ml-auto"><Bookmark className="h-7 w-7" /></button>
        </div>
        <p className="mt-2 text-sm font-bold">
          {post.likesCount.toLocaleString()} {post.likesCount === 1 ? "like" : "likes"}
        </p>
        {post.caption && (
          <p className="mt-1 text-sm">
            <span className="font-semibold">@{post.authorUsername}</span>{" "}
            <span dangerouslySetInnerHTML={{ __html: post.caption.replace(/(#\w+)/g, '<span class="text-primary">$1</span>') }} />
          </p>
        )}
      </div>
    </article>
  );
}

function CreatePostSheet({ userId, profile, onClose, onPosted }: {
  userId: string;
  profile: Profile | undefined;
  onClose: () => void;
  onPosted: () => void;
}) {
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [kcal, setKcal] = useState("");
  const [protein, setProtein] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  const submit = async () => {
    if (!caption.trim() && !imageFile) { setError("Add a caption or photo."); return; }
    setPosting(true);
    setError(null);
    try {
      const macros = (kcal || protein) ? { kcal: parseInt(kcal) || 0, protein: parseInt(protein) || 0 } : undefined;
      await createPost(userId, caption, imageFile, macros);
      onPosted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post. Try again.");
      setPosting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md rounded-t-3xl bg-card"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
          <h2 className="font-semibold">New post</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4" style={{ maxHeight: "70dvh" }}>
          {imagePreview ? (
            <div className="relative">
              <img src={imagePreview} alt="preview" className="h-52 w-full rounded-2xl object-cover" />
              <button
                onClick={removeImage}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              <button
                onClick={() => fileRef.current?.click()}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-5 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                <ImageIcon className="h-5 w-5" /> Add photo
              </button>
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex items-center justify-center rounded-2xl border-2 border-dashed border-border px-5 py-5 text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                <Camera className="h-5 w-5" />
              </button>
            </div>
          )}

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={`What did you eat, lift, or achieve today, @${profile?.username ?? "you"}?`}
            rows={3}
            className="input w-full resize-none text-sm"
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <p className="mb-1 text-xs font-semibold text-muted-foreground">Calories (optional)</p>
              <input type="number" value={kcal} onChange={(e) => setKcal(e.target.value)}
                placeholder="e.g. 650" className="input text-sm" />
            </div>
            <div className="flex-1">
              <p className="mb-1 text-xs font-semibold text-muted-foreground">Protein g (optional)</p>
              <input type="number" value={protein} onChange={(e) => setProtein(e.target.value)}
                placeholder="e.g. 45" className="input text-sm" />
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm font-medium text-destructive">{error}</p>
          )}

          <button
            onClick={submit}
            disabled={posting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-sunset py-4 font-semibold text-primary-foreground shadow-glow transition disabled:opacity-60"
          >
            {posting ? <><Loader2 className="h-4 w-4 animate-spin" /> Posting…</> : "Share post"}
          </button>
        </div>
      </div>
    </>
  );
}
