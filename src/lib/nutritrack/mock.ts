// Mock social data for NutriGram & messaging.

export interface MockUser {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  goal: "lose" | "maintain" | "gain";
  streak: number;
  bio: string;
}

export interface MockPost {
  id: string;
  userId: string;
  image: string;
  caption: string;
  likes: number;
  comments: { id: string; userId: string; text: string }[];
  hoursAgo: number;
  macros?: { kcal: number; p: number };
  tag?: string;
}

export interface MockThread {
  id: string;
  userId: string;
  unread: number;
  messages: { id: string; from: "me" | "them"; text: string; minutesAgo: number }[];
}

const a = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear`;

export const mockUsers: MockUser[] = [
  { id: "u1", name: "Maya Chen", handle: "mayalifts", avatar: a("Maya"), goal: "gain", streak: 47, bio: "Powerlifter • bulking szn 🏋️‍♀️" },
  { id: "u2", name: "Jordan Reyes", handle: "jrunsfar", avatar: a("Jordan"), goal: "lose", streak: 23, bio: "Marathon training, -12 lbs and counting" },
  { id: "u3", name: "Priya Patel", handle: "priyaeats", avatar: a("Priya"), goal: "maintain", streak: 112, bio: "Plant-forward home cook 🌱" },
  { id: "u4", name: "Alex Kim", handle: "alexgains", avatar: a("Alex"), goal: "gain", streak: 9, bio: "Skinny → strong, day 9" },
  { id: "u5", name: "Sam Okafor", handle: "samfitness", avatar: a("Sam"), goal: "lose", streak: 60, bio: "CrossFit coach. Cut day 60." },
  { id: "u6", name: "Lena Holm", handle: "lenahomechef", avatar: a("Lena"), goal: "maintain", streak: 200, bio: "Macros + flavor 🔥" },
];

export const mockPosts: MockPost[] = [
  {
    id: "p1", userId: "u1",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80",
    caption: "Bulk lunch hit different today 🥩 #cutting #mealprep", likes: 482, hoursAgo: 2,
    macros: { kcal: 920, p: 62 }, tag: "🔼 Bulking",
    comments: [
      { id: "c1", userId: "u3", text: "this looks insane" },
      { id: "c2", userId: "u4", text: "recipe?? 🙏" },
    ],
  },
  {
    id: "p2", userId: "u2",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    caption: "Day 23. Down another 0.6 kg. Slow and steady wins. 🏃‍♂️", likes: 1204, hoursAgo: 5,
    tag: "🔽 Cutting",
    comments: [{ id: "c3", userId: "u5", text: "lets gooo" }],
  },
  {
    id: "p3", userId: "u3",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    caption: "Rainbow bowl, 38g protein from tempeh + edamame ✨ #plantbased", likes: 287, hoursAgo: 8,
    macros: { kcal: 540, p: 38 }, tag: "⚖️ Maintaining",
    comments: [],
  },
  {
    id: "p4", userId: "u5",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    caption: "60 day streak unlocked 🔥🔥🔥 Thanks for all the love.", likes: 2103, hoursAgo: 14,
    tag: "🔥 60 day streak",
    comments: [
      { id: "c4", userId: "u1", text: "MONSTER" },
      { id: "c5", userId: "u6", text: "Inspiring 👏" },
    ],
  },
  {
    id: "p5", userId: "u6",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    caption: "Pizza night, hit my macros perfectly. You can have it all. 🍕", likes: 654, hoursAgo: 20,
    macros: { kcal: 780, p: 42 },
    comments: [],
  },
];

export const mockThreads: MockThread[] = [
  {
    id: "t1", userId: "u1", unread: 2,
    messages: [
      { id: "m1", from: "them", text: "yo nice streak 🔥", minutesAgo: 120 },
      { id: "m2", from: "me", text: "thanks! cutting is brutal lol", minutesAgo: 90 },
      { id: "m3", from: "them", text: "lmk if u want my high vol meal preps", minutesAgo: 12 },
      { id: "m4", from: "them", text: "got a killer chicken bowl recipe 🍱", minutesAgo: 8 },
    ],
  },
  {
    id: "t2", userId: "u3", unread: 0,
    messages: [
      { id: "m5", from: "me", text: "your tempeh bowl looks amazing", minutesAgo: 60 * 24 },
      { id: "m6", from: "them", text: "ty!! recipe up tonight 💚", minutesAgo: 60 * 23 },
    ],
  },
  {
    id: "t3", userId: "u5", unread: 1,
    messages: [
      { id: "m7", from: "them", text: "accountability check — log today?", minutesAgo: 200 },
    ],
  },
];

export function getUser(id: string) {
  return mockUsers.find((u) => u.id === id)!;
}
