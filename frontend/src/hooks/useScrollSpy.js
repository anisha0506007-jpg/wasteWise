import { useEffect, useState } from 'react';

/**
 * Returns the id of the section the user is currently reading.
 * Returns '' when the user is at the very top (the "Home" area).
 *
 * sectionIds must be a stable array (define it outside the component).
 */
function useScrollSpy(sectionIds, { enabled = true, offset = 120 } = {}) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (!enabled) return undefined;

    const handleScroll = () => {
      let current = '';

      // The last section whose top has passed the offset line is "active"
      sectionIds.forEach((id) => {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= offset) {
          current = id;
        }
      });

      // At the very bottom of the page, activate the last section
      const reachedBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (reachedBottom) current = sectionIds[sectionIds.length - 1];

      setActiveId(current);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [sectionIds, enabled, offset]);

  return enabled ? activeId : '';
}

export default useScrollSpy;