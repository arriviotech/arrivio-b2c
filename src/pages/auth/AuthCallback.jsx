import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for the auth state to be confirmed after OAuth redirect
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // --- POPUP HANDLER ---
        if (window.opener) {
          window.close();
          return;
        }

        // 1. RECOVER STATE (Booking Data)
        const savedState = sessionStorage.getItem('booking_redirect_state');
        // 2. RECOVER PATH (Return URL)
        const returnPath = sessionStorage.getItem('auth_return_path');

        // Clear items only after reading
        sessionStorage.removeItem('booking_redirect_state');
        sessionStorage.removeItem('auth_return_path');

        if (savedState) {
          const parsedState = JSON.parse(savedState);
          navigate('/booking/review', { state: parsedState, replace: true });
        } else if (returnPath && returnPath !== '/login' && returnPath !== '/signin' && returnPath !== '/auth/callback') {
          navigate(returnPath, { replace: true });
        } else {
          navigate('/', { replace: true });
        }

        subscription.unsubscribe();
      }
    });

    // Fallback: if no auth event fires within 5 seconds, redirect home
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      navigate('/', { replace: true });
    }, 5000);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [navigate]);

  return null;
};

export default AuthCallback;
