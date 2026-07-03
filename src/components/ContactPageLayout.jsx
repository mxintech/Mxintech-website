import React, { useEffect, useState } from 'react';
import ContactForm from '../ContactForm';
import { getContactFormConfig } from '../config/contactForms';

const ContactPageLayout = ({ contactType }) => {
  const config = getContactFormConfig(contactType);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [contactType]);

  if (!config) {
    return null;
  }

  const ProfileIcon = config.icon;

  return (
    <section
      id="contacto"
      className={`section contact-section ${visible ? 'contact-section--visible' : ''}`}
      style={{ '--contact-accent': config.accent }}
    >
      <div className="contact-grid">
        <div className="contact-hero contact-animate contact-animate-1">
          <div className="contact-hero-badge" aria-hidden="true">
            <ProfileIcon className="contact-hero-icon" />
          </div>
          <p className="contact-hero-tagline">{config.tagline}</p>
          <h2>{config.headline}</h2>
          <p className="contact-hero-intro">{config.intro}</p>
          {config.image && (
            <img
              src={config.image.src}
              alt={config.image.alt}
              className="contact-hero-photo"
              loading="lazy"
            />
          )}
          <ul className="contact-benefits">
            {config.benefits.map(({ icon: BenefitIcon, title, text }) => (
              <li key={title} className="contact-benefit">
                <span className="contact-benefit-icon" aria-hidden="true">
                  <BenefitIcon />
                </span>
                <span className="contact-benefit-body">
                  <strong>{title}</strong>
                  <span>{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="contact-form-panel contact-animate contact-animate-2">
          <ContactForm
            contactType={contactType}
            formConfig={config.form}
            wizardConfig={config.wizard}
          />
        </div>
      </div>
    </section>
  );
};

export default ContactPageLayout;
