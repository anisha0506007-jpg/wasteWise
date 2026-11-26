import { useEffect, useState } from 'react';
import { HeartHandshake, Info, Package, PackageCheck, Store } from 'lucide-react';

import Reveal from '../common/Reveal.jsx';
import SectionHeader from '../common/SectionHeader.jsx';
import useInView from '../../hooks/useInView.js';
import './ImpactStats.css';

// DEMONSTRATION VALUES ONLY. Replace with real database analytics later.
const STATS = [
  { icon: Package, end: 10000, suffix: '+', label: 'kg Food Rescued' },
  { icon: Store, end: 500, suffix: '+', label: 'Businesses Connected' },
  { icon: HeartHandshake, end: 200, suffix: '+', label: 'NGOs Supported' },
  { icon: PackageCheck, end: 5000, suffix: '+', label: 'Successful Donations' },
];

/**
 * Counts from 0 up to `end` when scrolled into view.
 * Users who prefer reduced motion see the final number immediately.
 */
function CountUp({ end, suffix = '', duration = 1800 }) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setValue(end);
      return undefined;
    }

    let frameId;
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // slows down at the end
      setValue(Math.round(end * eased));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {value.toLocaleString('en-US')}
      {suffix}
    </span>
  );
}

function ImpactStats() {
  return (
    <section id="impact" className="impact" aria-labelledby="impact-title">
      <div className="impact__shape impact__shape--one" aria-hidden="true" />
      <div className="impact__shape impact__shape--two" aria-hidden="true" />

      <div className="container impact__inner">
        <SectionHeader
          light
          eyebrow="Demonstration figures"
          titleId="impact-title"
          title="Impact at a glance"
          description="Sample numbers that show how this section will look. Live figures from the WasteWise database will replace them."
        />

        <div className="impact__grid">
          {STATS.map(({ icon: Icon, end, suffix, label }, index) => (
            <Reveal key={label} delay={index % 4} fill>
              <div className="impact__card">
                <span className="impact__icon">
                  <Icon size={24} aria-hidden="true" />
                </span>
                <span className="impact__value">
                  <CountUp end={end} suffix={suffix} />
                </span>
                <span className="impact__label">{label}</span>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="impact__note">
          <Info size={16} aria-hidden="true" />
          These are demonstration values only, not actual platform statistics.
        </p>
      </div>
    </section>
  );
}

export default ImpactStats;