import { HeartHandshake, PackageCheck, PackagePlus } from 'lucide-react';

import Reveal from '../common/Reveal.jsx';
import SectionHeader from '../common/SectionHeader.jsx';
import './HowItWorks.css';

const STEPS = [
  {
    number: '01',
    icon: PackagePlus,
    title: 'List Surplus Products',
    text: 'Businesses add their unsold products with quantity and expiry details.',
  },
  {
    number: '02',
    icon: HeartHandshake,
    title: 'Connect With NGOs',
    text: 'NGOs and individuals browse available donations and submit requests.',
  },
  {
    number: '03',
    icon: PackageCheck,
    title: 'Rescue and Collect',
    text: 'Products are collected before expiry, reducing unnecessary waste.',
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="how" aria-labelledby="how-title">
      <div className="container">
        <SectionHeader
          eyebrow="How it works"
          titleId="how-title"
          title="Three simple steps from surplus to someone's plate"
          description="No complicated process. List it, connect, and collect."
        />

        <div className="how__grid">
          {STEPS.map(({ number, icon: Icon, title, text }, index) => (
            <Reveal key={number} delay={index} className="how__item">
              <article className="how__card">
                <span className="how__number" aria-hidden="true">
                  {number}
                </span>
                <span className="how__icon">
                  <Icon size={30} aria-hidden="true" />
                </span>
                <span className="how__step">Step {index + 1}</span>
                <h3 className="how__title">{title}</h3>
                <p className="how__text">{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;