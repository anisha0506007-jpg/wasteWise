import { Info, Quote } from 'lucide-react';

import Reveal from '../common/Reveal.jsx';
import SectionHeader from '../common/SectionHeader.jsx';
import './Testimonials.css';

// FICTIONAL sample testimonials written for the design.
// Replace with real, permission-approved reviews before launch.
const TESTIMONIALS = [
  {
    initials: 'AM',
    name: 'Aarav Mehta',
    role: 'Bakery owner (sample)',
    text: 'Our evening bread used to go straight into the bin. A simple way to list it and know someone will collect it changes our closing routine completely.',
  },
  {
    initials: 'PN',
    name: 'Priya Nair',
    role: 'NGO coordinator (sample)',
    text: 'Finding surplus food used to mean dozens of phone calls. Seeing available items with pickup times in one place would save our volunteers hours every week.',
  },
  {
    initials: 'DB',
    name: 'Daniel Brooks',
    role: 'Hotel operations manager (sample)',
    text: 'Event days leave us with a lot of untouched food. Expiry reminders and a clear pickup flow make it easy to act on it instead of throwing it away.',
  },
];

function Testimonials() {
  return (
    <section
      id="testimonials"
      className="testimonials"
      aria-labelledby="testimonials-title"
    >
      <div className="container">
        <SectionHeader
          eyebrow="Testimonials"
          titleId="testimonials-title"
          title="What people could say about WasteWise"
          description="Here is the kind of feedback we are building toward."
        />

        <p className="testimonials__note">
          <Info size={16} aria-hidden="true" />
          <span>
            These testimonials are fictional samples for demonstration. They are
            not real or verified customer reviews.
          </span>
        </p>

        <div className="testimonials__grid">
          {TESTIMONIALS.map(({ initials, name, role, text }, index) => (
            <Reveal key={name} delay={index} fill>
              <figure className="testimonial-card">
                <Quote
                  className="testimonial-card__quote"
                  size={32}
                  aria-hidden="true"
                />
                <blockquote className="testimonial-card__text">{text}</blockquote>
                <figcaption className="testimonial-card__author">
                  <span className="testimonial-card__avatar" aria-hidden="true">
                    {initials}
                  </span>
                  <span className="testimonial-card__meta">
                    <span className="testimonial-card__name">{name}</span>
                    <span className="testimonial-card__role">{role}</span>
                  </span>
                  <span className="testimonial-card__tag">Sample</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;