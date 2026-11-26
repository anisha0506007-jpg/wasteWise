import {
  Croissant,
  HeartHandshake,
  Hotel,
  ShoppingBasket,
  Users,
  Utensils,
} from 'lucide-react';

import Reveal from '../common/Reveal.jsx';
import SectionHeader from '../common/SectionHeader.jsx';
import './TrustSection.css';

const SUPPORTED_GROUPS = [
  { icon: Utensils, name: 'Restaurants', text: 'Surplus meals and fresh ingredients' },
  { icon: Croissant, name: 'Bakeries', text: 'Bread and pastries left at closing' },
  { icon: ShoppingBasket, name: 'Grocery Stores', text: 'Near-expiry fresh and packaged items' },
  { icon: Hotel, name: 'Hotels', text: 'Banquet and buffet surplus' },
  { icon: HeartHandshake, name: 'NGOs & Charities', text: 'Organizations feeding people in need' },
  { icon: Users, name: 'Local Communities', text: 'Neighbours who collect and share' },
];

function TrustSection() {
  return (
    <section id="supporters" className="trust" aria-labelledby="trust-title">
      <div className="container">
        <SectionHeader
          eyebrow="Who we support"
          titleId="trust-title"
          title="Built for everyone in the food-rescue chain"
          description="From the kitchens that produce surplus to the communities that need it, WasteWise brings every link together."
        />

        <div className="trust__grid">
          {SUPPORTED_GROUPS.map(({ icon: Icon, name, text }, index) => (
            <Reveal key={name} delay={index % 3} fill>
              <div className="trust__card">
                <span className="trust__icon">
                  <Icon size={26} aria-hidden="true" />
                </span>
                <h3 className="trust__name">{name}</h3>
                <p className="trust__text">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustSection;