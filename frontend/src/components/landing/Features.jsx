import {
  BellRing,
  Gift,
  MapPin,
  PackagePlus,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

import Reveal from '../common/Reveal.jsx';
import SectionHeader from '../common/SectionHeader.jsx';
import './Features.css';

// Remove the "badge" line when the feature is actually built.
const FEATURES = [
  {
    icon: PackagePlus,
    title: 'Easy Product Listing',
    text: 'Add surplus items in a minute with quantity, category, pickup window, and expiry date.',
  },
  {
    icon: BellRing,
    title: 'Smart Expiry Alerts',
    text: 'Timely reminders for items nearing expiry so nothing is forgotten on the shelf.',
  },
  {
    icon: Gift,
    title: 'Donation Requests',
    text: 'NGOs and individuals send requests, and businesses approve the best match.',
  },
  {
    icon: Sparkles,
    title: 'AI Waste Prediction',
    text: 'Spot patterns in your surplus to forecast what you are likely to over-produce.',
    badge: 'Coming soon',
  },
  {
    icon: MapPin,
    title: 'Real-Time Tracking',
    text: 'Follow each donation from listing to request to pickup with clear status updates.',
  },
  {
    icon: TrendingUp,
    title: 'Impact Analytics',
    text: 'See how much food you have rescued and the waste you have avoided over time.',
  },
];

function Features() {
  return (
    <section id="features" className="features" aria-labelledby="features-title">
      <div className="container">
        <SectionHeader
          eyebrow="Features"
          titleId="features-title"
          title="Everything you need to rescue surplus food"
          description="Simple tools for businesses, NGOs, and individuals, all in one platform."
        />

        <div className="features__grid">
          {FEATURES.map(({ icon: Icon, title, text, badge }, index) => (
            <Reveal key={title} delay={index % 3} fill>
              <article className="feature-card">
                <span className="feature-card__icon">
                  <Icon size={26} aria-hidden="true" />
                </span>
                <h3 className="feature-card__title">
                  {title}
                  {badge && <span className="feature-card__badge">{badge}</span>}
                </h3>
                <p className="feature-card__text">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;