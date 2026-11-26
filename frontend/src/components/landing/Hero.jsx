import {
  ArrowRight,
  BellRing,
  Check,
  Leaf,
  Package,
  Search,
  Users,
} from 'lucide-react';

import Button from '../common/Button.jsx';
import Reveal from '../common/Reveal.jsx';
import SmartImage from '../common/SmartImage.jsx';
import './Hero.css';

const HERO_POINTS = [
  'Quick product listing',
  'Expiry-aware pickups',
  'Community-first approach',
];

function Hero() {
  return (
    <section id="home" className="hero" aria-labelledby="hero-title">
      {/* Decorative background (hidden from screen readers) */}
      <div className="hero__bg-shape hero__bg-shape--one" aria-hidden="true" />
      <div className="hero__bg-shape hero__bg-shape--two" aria-hidden="true" />
      <div className="hero__dots" aria-hidden="true" />

      <div className="container hero__inner">
        {/* ---------- Text ---------- */}
        <Reveal className="hero__content">
          <span className="hero__eyebrow">
            <Leaf size={16} aria-hidden="true" />
            Smart surplus food rescue
          </span>

          <h1 id="hero-title" className="hero__title">
            Turn Surplus Into Something{' '}
            <span className="hero__title-highlight">Meaningful.</span>
          </h1>

          <p className="hero__subtitle">
            Connecting businesses with communities to rescue surplus food,
            reduce waste, and create a better tomorrow.
          </p>

          <div className="hero__actions">
            <Button
              to="/register"
              size="lg"
              rightIcon={<ArrowRight size={18} aria-hidden="true" />}
            >
              Start Donating
            </Button>
            <Button
              to="/explore"
              size="lg"
              variant="outline"
              leftIcon={<Search size={18} aria-hidden="true" />}
            >
              Explore Available Food
            </Button>
          </div>

          <ul className="hero__points">
            {HERO_POINTS.map((point) => (
              <li key={point} className="hero__point">
                <Check size={16} aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* ---------- Image + floating cards ---------- */}
        <Reveal direction="left" delay={2} className="hero__visual">
          <Leaf
            className="hero__leaf hero__leaf--one"
            size={48}
            aria-hidden="true"
          />
          <Leaf
            className="hero__leaf hero__leaf--two"
            size={34}
            aria-hidden="true"
          />
          <Leaf
            className="hero__leaf hero__leaf--three"
            size={40}
            aria-hidden="true"
          />

          <SmartImage
            className="hero__image"
            src="/images/hero-food-donation.jpg"
            alt="Volunteers packing boxes of fresh surplus food for donation"
            priority
          />

          <div className="hero__card hero__card--one">
            <span className="hero__card-icon hero__card-icon--accent">
              <BellRing size={18} aria-hidden="true" />
            </span>
            <span>
              <span className="hero__card-value">Expires in 4 h</span>
              <span className="hero__card-label">Sample: fresh bread, 12 kg</span>
            </span>
          </div>

          <div className="hero__card hero__card--two">
            <span className="hero__card-icon">
              <Package size={18} aria-hidden="true" />
            </span>
            <span>
              <span className="hero__card-value">10,000+ kg</span>
              <span className="hero__card-label">Food rescued (demo)</span>
            </span>
          </div>

          <div className="hero__card hero__card--three">
            <span className="hero__card-icon">
              <Users size={18} aria-hidden="true" />
            </span>
            <span>
              <span className="hero__card-value">500+</span>
              <span className="hero__card-label">Businesses connected (demo)</span>
            </span>
          </div>

          <p className="hero__caption">
            Illustrative preview. Figures shown are sample data.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export default Hero;