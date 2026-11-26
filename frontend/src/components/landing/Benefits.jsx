import { ArrowRight, Check, HeartHandshake, Store } from 'lucide-react';

import Button from '../common/Button.jsx';
import Reveal from '../common/Reveal.jsx';
import SectionHeader from '../common/SectionHeader.jsx';
import './Benefits.css';

const AUDIENCES = [
  {
    id: 'business',
    icon: Store,
    title: 'For Businesses',
    subtitle: 'Turn unsold stock into community support.',
    items: [
      { title: 'Reduce waste', text: 'Move unsold stock to people who need it before it expires.' },
      { title: 'Support communities', text: 'Turn surplus into meals and essentials for local families.' },
      { title: 'Track donations', text: 'Keep a clear record of every listing, request, and pickup.' },
      { title: 'Improve sustainability', text: 'Lower your environmental footprint and show your progress.' },
    ],
    buttonLabel: 'List Surplus Food',
    buttonTo: '/register?role=business',
  },
  {
    id: 'ngo',
    icon: HeartHandshake,
    title: 'For NGOs',
    subtitle: 'Find and collect food for the people you serve.',
    items: [
      { title: 'Find nearby donations', text: 'Browse available items close to your location.' },
      { title: 'Request surplus products', text: 'Send requests in a few clicks and get a quick response.' },
      { title: 'Save collection time', text: 'See pickup windows up front and plan efficient trips.' },
      { title: 'Track rescued resources', text: 'Monitor everything your organization has received.' },
    ],
    buttonLabel: 'Request Donations',
    buttonTo: '/register?role=ngo',
  },
];

function Benefits() {
  return (
    <section id="benefits" className="benefits" aria-labelledby="benefits-title">
      <div className="container">
        <SectionHeader
          eyebrow="Benefits"
          titleId="benefits-title"
          title="A win for businesses and communities"
          description="WasteWise is designed so everyone who takes part gets something valuable."
        />

        <div className="benefits__grid">
          {AUDIENCES.map((audience, index) => {
            const Icon = audience.icon;
            return (
              <Reveal key={audience.id} delay={index * 2} fill>
                <article className={`benefit-card benefit-card--${audience.id}`}>
                  <div className="benefit-card__header">
                    <span className="benefit-card__icon">
                      <Icon size={28} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="benefit-card__title">{audience.title}</h3>
                      <p className="benefit-card__subtitle">{audience.subtitle}</p>
                    </div>
                  </div>

                  <ul className="benefit-card__list">
                    {audience.items.map((item) => (
                      <li key={item.title} className="benefit-card__item">
                        <span className="benefit-card__check">
                          <Check size={14} aria-hidden="true" />
                        </span>
                        <span>
                          <span className="benefit-card__item-title">{item.title}</span>
                          <span className="benefit-card__item-text">{item.text}</span>
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    to={audience.buttonTo}
                    rightIcon={<ArrowRight size={18} aria-hidden="true" />}
                  >
                    {audience.buttonLabel}
                  </Button>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Benefits;