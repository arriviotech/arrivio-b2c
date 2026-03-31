import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "../supabase/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================
  // AUTH MODAL STATE
  // ==========================
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const onAuthSuccessRef = useRef(null);
  const pendingBookingStateRef = useRef(null);

  const openAuthModal = useCallback((onSuccess, pendingState) => {
    onAuthSuccessRef.current = onSuccess || null;
    pendingBookingStateRef.current = pendingState || null;
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    // Note: we don't clear onAuthSuccessRef here — it gets fired in the effect below
  }, []);

  // ==========================
  // AUTH LIFECYCLE
  // ==========================
  useEffect(() => {
    let mounted = true;

    // ======================
    // 1. Restore session FAST
    // ======================
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      const session = data.session;

      setSession(session);
      setUser(session?.user ?? null);

      setLoading(false);
    });

    // ======================
    // 2. Listen login/logout
    // ======================
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fire pending auth success callback (e.g. from booking widget)
        if (onAuthSuccessRef.current) {
          const callback = onAuthSuccessRef.current;
          onAuthSuccessRef.current = null;
          // Defer to next tick so state is settled
          setTimeout(() => callback(session.user), 0);
        }
      }
    });

    // ======================
    // cleanup
    // ======================
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ==========================
  // LOGOUT
  // ==========================
  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signOut,
        // Modal State
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        pendingBookingStateRef
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==========================
// HOOK
// ==========================
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
