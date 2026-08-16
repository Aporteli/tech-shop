import { useState, useEffect, useRef } from 'react';

const HIDDEN_OFFSET_PX = 0;

function setHeaderOffset(headerState, headerHeight) {
  const offset = headerState === 'hidden' ? HIDDEN_OFFSET_PX : headerHeight;
  document.documentElement.style.setProperty('--header-offset', `${offset}px`);
}

export const useHeaderScroll = (headerHeight = 80) => {
  const [headerState, setHeaderState] = useState('visible');
  const [atTop, setAtTop] = useState(() => window.scrollY <= 0);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const update = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      setAtTop(currentScrollY <= 0);

      if (currentScrollY <= 8) {
        setHeaderState('visible');
      } else if (delta > 2 && currentScrollY > headerHeight) {
        setHeaderState('hidden');
      } else if (delta < -2) {
        setHeaderState('sticky');
      }

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [headerHeight]);

  useEffect(() => {
    setHeaderOffset(headerState, headerHeight);
  }, [headerState, headerHeight]);

  useEffect(() => {
    return () => {
      document.documentElement.style.removeProperty('--header-offset');
    };
  }, []);

  return { headerState, atTop };
};
