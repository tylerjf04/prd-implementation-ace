import { supabase } from "@/lib/supabase";

export interface Post {
  id: string;
  userId: string;
  caption: string;
  imageUrl: string | null;
  macrosKcal: number | null;
  macrosProtein: number | null;
  likesCount: number;
  likedByMe: boolean;
  createdAt: string;
  authorUsername: string;
  authorName: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPost(row: any, myLikedIds: Set<string>, profileMap: Map<string, any>): Post {
  const profile = profileMap.get(row.user_id);
  return {
    id: row.id,
    userId: row.user_id,
    caption: row.caption ?? "",
    imageUrl: row.image_url ?? null,
    macrosKcal: row.macros_kcal ?? null,
    macrosProtein: row.macros_protein ?? null,
    likesCount: row.likes_count ?? 0,
    likedByMe: myLikedIds.has(row.id),
    createdAt: row.created_at,
    authorUsername: profile?.username ?? "unknown",
    authorName: profile?.display_name ?? "User",
  };
}

export async function loadFeedPosts(currentUserId: string): Promise<Post[]> {
  const [postsRes, myLikesRes] = await Promise.all([
    supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("post_likes").select("post_id").eq("user_id", currentUserId),
  ]);

  const posts = postsRes.data ?? [];
  if (posts.length === 0) return [];

  const myLikedIds = new Set((myLikesRes.data ?? []).map((l: { post_id: string }) => l.post_id));
  const userIds = [...new Set(posts.map((p) => p.user_id as string))];
  const { data: profiles } = await supabase.from("profiles").select("id, username, display_name").in("id", userIds);
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return posts.map((row) => rowToPost(row, myLikedIds, profileMap));
}

export async function loadUserPosts(userId: string, currentUserId: string): Promise<Post[]> {
  const [postsRes, myLikesRes, profileRes] = await Promise.all([
    supabase.from("posts").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("post_likes").select("post_id").eq("user_id", currentUserId),
    supabase.from("profiles").select("id, username, display_name").eq("id", userId).maybeSingle(),
  ]);

  const posts = postsRes.data ?? [];
  const myLikedIds = new Set((myLikesRes.data ?? []).map((l: { post_id: string }) => l.post_id));
  const profileMap = new Map([[userId, profileRes.data]]);

  return posts.map((row) => rowToPost(row, myLikedIds, profileMap));
}

export async function toggleLike(postId: string, userId: string, currentlyLiked: boolean): Promise<void> {
  if (currentlyLiked) {
    await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId);
  } else {
    await supabase.from("post_likes").insert({ post_id: postId, user_id: userId });
  }
}

export async function createPost(
  userId: string,
  caption: string,
  imageFile: File | null,
  macros?: { kcal: number; protein: number },
): Promise<void> {
  let imageUrl: string | null = null;

  if (imageFile) {
    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(path, imageFile, { upsert: true });
    if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
    const { data: { publicUrl } } = supabase.storage.from("post-images").getPublicUrl(path);
    imageUrl = publicUrl;
  }

  const { error } = await supabase.from("posts").insert({
    user_id: userId,
    caption: caption.trim(),
    image_url: imageUrl,
    macros_kcal: macros?.kcal || null,
    macros_protein: macros?.protein || null,
  });
  if (error) throw new Error(`Post failed: ${error.message}`);
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

export function timeAgo(createdAt: string): string {
  const diff = Date.now() - new Date(createdAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(createdAt).toLocaleDateString();
}
