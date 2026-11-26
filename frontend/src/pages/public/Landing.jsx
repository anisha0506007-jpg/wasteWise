import Hero from '../../components/landing/Hero.jsx';
import TrustSection from '../../components/landing/TrustSection.jsx';
import HowItWorks from '../../components/landing/HowItWorks.jsx';
import Features from '../../components/landing/Features.jsx';
import About from '../../components/landing/About.jsx';
import ImpactStats from '../../components/landing/ImpactStats.jsx';
import Benefits from '../../components/landing/Benefits.jsx';
import Testimonials from '../../components/landing/Testimonials.jsx';
import FAQ from '../../components/landing/FAQ.jsx';
import FinalCTA from '../../components/landing/FinalCTA.jsx';

import './Landing.css';

// The Navbar and Footer come from MainLayout, so they are not repeated here.
function Landing() {
  return (
    <div className="landing">
      <Hero />
      <TrustSection />
      <HowItWorks />
      <Features />
      <About />
      <ImpactStats />
      <Benefits />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </div>
  );
}

export default Landing;