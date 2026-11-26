import { ArrowRight, Check, HeartHandshake } from 'lucide-react';

import Button from '../common/Button.jsx';
import Reveal from '../common/Reveal.jsx';
import SectionHeader from '../common/SectionHeader.jsx';
import SmartImage from '../common/SmartImage.jsx';
import './About.css';

const ABOUT_POINTS = [
  'Surplus food reaches people instead of landfill',
  'Businesses get a simple, trackable way to give back',
  'NGOs and neighbours collect before items expire',
];

function About() {
  return (
    <section id="about" className="about" aria-labelledby="about-title">
      <div className="container about__inner">
        {/* ---------- Image ---------- */}
        <Reveal direction="right" className="about__media">
          <SmartImage
            className="about__image"
            src="/images/about-community.jpg"
            alt="Community members sharing and collecting fresh food together"
            fallbackIcon={HeartHandshake}
          />
          <div className="about__badge">
            <span className="about__badge-icon">
              <HeartHandshake size={20} aria-hidden="true" />
            </span>
            <span>
              <span className="about__badge-title">Community first</span>
              <span className="about__badge-text">
                Good food belongs on a plate, not in a bin.
              </span>
            </span>
          </div>
        </Reveal>

        {/* ---------- Text ---------- */}
        <Reveal delay={2} className="about__content">
          <SectionHeader
            align="left"
            eyebrow="About WasteWise"
            titleId="about-title"
            title="Small Actions. Bigger Impact."
            description="Around a billion tonnes of food are wasted worldwide every year, according to the UN Environment Programme's Food Waste Index Report 2024, while many people still go without enough to eat."
          />

          <p className="about__text">
            Much of that surplus comes from restaurants, bakeries, stores, and
            hotels, often just hours before it would have been perfectly good to
            eat. WasteWise gives businesses a fast way to share that surplus and
            helps NGOs and neighbours find it, request it, and collect it in
            time.
          </p>

          <ul className="about__list">
            {ABOUT_POINTS.map((point) => (
              <li key={point} className="about__list-item">
                <span className="about__check">
                  <Check size={14} aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <Button
            to="/register"
            size="lg"
            rightIcon={<ArrowRight size={18} aria-hidden="true" />}
          >
            Join the Movement
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

export default About;