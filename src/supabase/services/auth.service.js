import { supabase } from "../client";

// ==========================
// SIGN UP (EMAIL + PASSWORD)
// ==========================
export async function signUpWithEmail(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  return data;
}

// ==========================
// SIGN IN (EMAIL + PASSWORD)
// ==========================
export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// ==========================
// SIGN IN WITH GOOGLE
// ==========================
// ==========================
// SIGN IN WITH GOOGLE
// ==========================
export async function signInWithGoogle() {
  return signInWithOAuth('google');
}

// ==========================
// SIGN IN WITH OAUTH (General)
// ==========================
export async function signInWithOAuth(provider, options = {}) {
  const { skipBrowserRedirect = false, queryParams = {} } = options;

  const authOptions = {
    redirectTo: window.location.origin + '/auth/callback',
    skipBrowserRedirect,
    queryParams: {
      access_type: 'offline',
      prompt: 'select_account',
      ...queryParams,
    },
  };

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: authOptions,
  });

  if (error) throw error;
  return data;
}

// ==========================
// SIGN IN WITH OTP (Email/Phone)
// ==========================
export async function signInWithOtp(email) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + '/auth/callback',
    },
  });

  if (error) throw error;
  return data;
}

// ==========================
// VERIFY OTP
// ==========================
export async function verifyOtp(email, token, type = 'email') {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type,
  });

  if (error) throw error;
  return data;
}

// ==========================
// SIGN OUT
// ==========================
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ==========================
// GET CURRENT SESSION
// ==========================
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// ==========================
// GET CURRENT USER
// ==========================
export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

// ==========================
// AUTH STATE LISTENER
// ==========================
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
