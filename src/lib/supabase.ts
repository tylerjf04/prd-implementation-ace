import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Abort any request that takes longer than 12 seconds so the UI never hangs forever
const fetchWithTimeout: typeof fetch = (input, init) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 12000);
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(id));
};

export const supabase = createClient(url, key, {
  global: { fetch: fetchWithTimeout },
});
