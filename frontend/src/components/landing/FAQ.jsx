import { useState } from 'react';
import { Mail, Minus, Plus } from 'lucide-react';

import Button from '../common/Button.jsx';
import Reveal from '../common/Reveal.jsx';
import SectionHeader from '../common/SectionHeader.jsx';
import './FAQ.css';

// Edit these answers so they match your real policies.
const FAQ_ITEMS = [
  {
    question: 'What is WasteWise?',
    answer:
      'WasteWise is a platform that connects businesses that have surplus food with NGOs, charities, and individuals who can use it, so good food is eaten instead of thrown away.',
  },
  {
    question: 'Who can use WasteWise?',
    answer:
      'Restaurants, bakeries, grocery stores, hotels, and other food businesses can list surplus products. NGOs, charities, and individuals can browse those listings and request what they need.',
  },
  {
    question: 'How can a business list surplus products?',
    answer:
      'Create a business account, add the product with its quantity, category, pickup window, and expiry date, then publish it. Registered NGOs and individuals will be able to see it and send a request.',
  },
  {
    question: 'Are donations free?',
    answer:
      'WasteWise is built around donating surplus food, so recipients are not expected to pay for items. Final terms will be published as the platform launches.',
  },
  {
    question: 'How can NGOs request products?',
    answer:
      'Register as an NGO, browse the available donations, and send a request on the listing you want. The business reviews it, and you collect the items during the pickup window.',
  },
  {
    question: 'How does WasteWise reduce food waste?',
    answer:
      'By shortening the time between "we have surplus" and "someone can use it". Clear expiry details, quick requests, and pickup tracking help food reach people before it spoils.',
  },
];

function FAQ() {
  // Index of the open question (-1 means all closed)
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = (index) => {
    setOpenIndex((current) => (current === index ? -1 : index));
  };

  return (
    <section id="faq" className="faq" aria-labelledby="faq-title">
      <div className="container faq__inner">
        <Reveal className="faq__intro">
          <SectionHeader
            align="left"
            eyebrow="FAQ"
            titleId="faq-title"
            title="Frequently asked questions"
            description="Quick answers to the things people ask most. Still unsure about something?"
          />
          <Button
            to="/#contact"
            variant="outline"
            leftIcon={<Mail size={18} aria-hidden="true" />}
          >
            Contact Us
          </Button>
        </Reveal>

        <Reveal delay={2} className="faq__list">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;
            const buttonId = `faq-question-${index}`;
            const panelId = `faq-answer-${index}`;

            return (
              <div
                key={item.question}
                className={`faq__item ${isOpen ? 'faq__item--open' : ''}`}
              >
                <h3 className="faq__heading">
                  <button
                    type="button"
                    id={buttonId}
                    className="faq__question"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => handleToggle(index)}
                  >
                    <span>{item.question}</span>
                    <span className="faq__icon" aria-hidden="true">
                      {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className="faq__answer"
                >
                  <div className="faq__answer-inner">
                    <p className="faq__answer-text">{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}

export default FAQ;