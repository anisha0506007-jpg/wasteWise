import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FALLBACK_NAVBAR_HEIGHT = 72;

function ScrollToTop() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const target = document.getElementById(id);

      if (target) {
        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : FALLBACK_NAVBAR_HEIGHT;
        const top =
          target.getBoundingClientRect().top + window.scrollY - navbarHeight;

        window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash, key]);

  return null;
}

export default ScrollToTop;