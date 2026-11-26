import { ArrowRight, Leaf, Search } from 'lucide-react';

import Button from '../common/Button.jsx';
import Reveal from '../common/Reveal.jsx';
import './FinalCTA.css';

function FinalCTA() {
  return (
    <section id="join" className="final-cta" aria-labelledby="final-cta-title">
      <div className="container">
        <Reveal>
          <div className="final-cta__card">
            <Leaf
              className="final-cta__leaf final-cta__leaf--one"
              size={120}
              aria-hidden="true"
            />
            <Leaf
              className="final-cta__leaf final-cta__leaf--two"
              size={90}
              aria-hidden="true"
            />

            <div className="final-cta__content">
              <h2 id="final-cta-title" className="final-cta__title">
                Don&apos;t Let Good Food Go to Waste.
              </h2>
              <p className="final-cta__text">
                Join WasteWise and help turn surplus into opportunity.
              </p>

              <div className="final-cta__actions">
                <Button
                  to="/register"
                  variant="accent"
                  size="lg"
                  rightIcon={<ArrowRight size={18} aria-hidden="true" />}
                >
                  Join WasteWise
                </Button>
                <Button
                  to="/explore"
                  variant="outline"
                  size="lg"
                  className="final-cta__outline"
                  leftIcon={<Search size={18} aria-hidden="true" />}
                >
                  Explore Donations
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default FinalCTA;