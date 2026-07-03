import { describe, it, expect } from 'vitest';
import { CONTACT_FORMS, getContactFormConfig } from './contactForms';
import { CONTACT_TYPES } from '../utils/contactFormValidation';

describe('contact form config integrity', () => {
  it('defines a config for every supported contact type', () => {
    CONTACT_TYPES.forEach((type) => {
      expect(CONTACT_FORMS[type], `missing config for ${type}`).toBeTruthy();
    });
  });

  it.each(Object.entries(CONTACT_FORMS))('%s has complete copy', (type, config) => {
    expect(config.contactType).toBe(type);
    expect(config.icon).toBeTruthy();
    expect(config.accent).toMatch(/^#/);
    expect(config.headline).toBeTruthy();
    expect(config.tagline).toBeTruthy();
    expect(config.intro).toBeTruthy();
    expect(config.benefits).toHaveLength(4);
    config.benefits.forEach((benefit) => {
      expect(benefit.icon).toBeTruthy();
      expect(benefit.title).toBeTruthy();
      expect(benefit.text).toBeTruthy();
    });
    expect(config.form.title).toBeTruthy();
    expect(config.form.submitLabel).toBeTruthy();
    expect(config.form.messageLabel).toBeTruthy();
  });

  it.each(Object.entries(CONTACT_FORMS))('%s has a valid wizard config', (type, config) => {
    expect(config.wizard, `missing wizard for ${type}`).toBeTruthy();
    expect(config.wizard.messageLead).toBeTruthy();
    expect(config.wizard.contactLead).toBeTruthy();

    if (config.wizard.choice) {
      expect(config.wizard.choice.title).toBeTruthy();
      expect(config.wizard.choice.messageLabel).toBeTruthy();
      expect(config.wizard.choice.options.length).toBeGreaterThanOrEqual(3);
      if (config.wizard.choice.required) {
        expect(config.wizard.choice.requiredError).toBeTruthy();
      }
    }
  });

  it('speaker leads with the talk title step', () => {
    expect(CONTACT_FORMS.speaker.form.showTalkTitle).toBe(true);
    expect(CONTACT_FORMS.speaker.wizard.talkTitle.title).toBeTruthy();
  });

  it.each(['member', 'leader', 'speaker'])('%s has a motivational hero image', (type) => {
    const { image } = CONTACT_FORMS[type];
    expect(image.src).toBe(`/img/${type}.jpg`);
    expect(image.alt).toBeTruthy();
  });

  it('returns null for unknown contact types', () => {
    expect(getContactFormConfig('nope')).toBeNull();
    expect(getContactFormConfig('member')).toBe(CONTACT_FORMS.member);
  });
});
