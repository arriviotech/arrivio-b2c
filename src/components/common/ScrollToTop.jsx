import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If we have a hash, try to scroll to that element (works for /#section links)
    // Skip auth callback hashes (e.g. #access_token=...) from Supabase OAuth
    if (hash && !hash.includes('=')) {
      window.setTimeout(() => {
        try {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          else window.scrollTo(0, 0);
        } catch {
          window.scrollTo(0, 0);
        }
      }, 0);
      return;
    }

    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
