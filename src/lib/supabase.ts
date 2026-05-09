import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Abort any request that takes longer than 12 seconds so the UI never hangs forever.
// Composes with any existing signal already in init so Supabase's own cancellation still works.
const fetchWithTimeout: typeof fetch = (input, init) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort("timeout"), 12000);

  const existingSignal = (init as RequestInit | undefined)?.signal;
  if (existingSignal) {
    existingSignal.addEventListener("abort", () => controller.abort(existingSignal.reason));
  }

  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(id));
};

export const supabase = createClient(url, key, {
  global: { fetch: fetchWithTimeout },
});
