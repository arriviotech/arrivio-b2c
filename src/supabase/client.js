import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.',
    'Run with: doppler run -- npm run dev'
  );
}

/**
 * Custom storage for Supabase that switches between 
 * localStorage and sessionStorage based on user preference.
 */
const customStorage = {
  getItem: (key) => {
    const rememberMe = localStorage.getItem('arrivio_remember_me') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    return storage.getItem(key);
  },
  setItem: (key, value) => {
    const rememberMe = localStorage.getItem('arrivio_remember_me') === 'true';
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(key, value);
  },
  removeItem: (key) => {
    // Try both to be safe
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
};

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: customStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
