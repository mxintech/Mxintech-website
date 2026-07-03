import { describe, it, expect } from 'vitest';
import {
  validateContactForm,
  validateVerificationCode,
  buildContactPayload,
  buildVerifyPayload,
  maskEmail,
  sanitizeField,
  LIMITS,
} from './contactFormValidation';

const validForm = {
  contactType: 'member',
  name: 'Ana López',
  email: 'ana@example.com',
  mobile: '',
  talkTitle: '',
  message: 'Quiero unirme a la comunidad.',
  turnstileToken: '',
  turnstileRequired: false,
};

describe('validateContactForm', () => {
  it('accepts a valid member form', () => {
    expect(validateContactForm(validForm)).toBeNull();
  });

  it('rejects unknown contact types', () => {
    expect(validateContactForm({ ...validForm, contactType: 'hacker' })).toMatch(/inválido/i);
  });

  it('requires name, email, and message', () => {
    expect(validateContactForm({ ...validForm, name: '' })).toMatch(/nombre es requerido/i);
    expect(validateContactForm({ ...validForm, email: '' })).toMatch(/correo/i);
    expect(validateContactForm({ ...validForm, message: '' })).toMatch(/mensaje es requerido/i);
  });

  it('rejects malformed emails', () => {
    expect(validateContactForm({ ...validForm, email: 'not-an-email' })).toMatch(/correo/i);
    expect(validateContactForm({ ...validForm, email: 'a@b' })).toMatch(/correo/i);
  });

  it('validates optional phone only when present', () => {
    expect(validateContactForm({ ...validForm, mobile: '' })).toBeNull();
    expect(validateContactForm({ ...validForm, mobile: '+52 246 123 4567' })).toBeNull();
    expect(validateContactForm({ ...validForm, mobile: 'abc' })).toMatch(/teléfono/i);
  });

  it('requires talk title only for speakers', () => {
    expect(
      validateContactForm({ ...validForm, contactType: 'speaker', talkTitle: '' })
    ).toMatch(/título/i);
    expect(
      validateContactForm({
        ...validForm,
        contactType: 'speaker',
        talkTitle: 'Introducción a EKS',
      })
    ).toBeNull();
  });

  it('blocks script content in text fields', () => {
    expect(
      validateContactForm({ ...validForm, message: '<script>alert(1)</script>' })
    ).toMatch(/contenido no permitido/i);
  });

  it('enforces length limits', () => {
    expect(
      validateContactForm({ ...validForm, message: 'x'.repeat(LIMITS.message + 1) })
    ).toMatch(/demasiado largo/i);
  });

  it('requires the turnstile token when enabled', () => {
    expect(
      validateContactForm({ ...validForm, turnstileRequired: true, turnstileToken: '' })
    ).toMatch(/anti-bots/i);
    expect(
      validateContactForm({ ...validForm, turnstileRequired: true, turnstileToken: 'tok' })
    ).toBeNull();
  });
});

describe('validateVerificationCode', () => {
  it('accepts exactly six digits', () => {
    expect(validateVerificationCode('123456')).toBeNull();
  });

  it('rejects short, long, and non-numeric codes', () => {
    expect(validateVerificationCode('')).toMatch(/ingresa/i);
    expect(validateVerificationCode('12345')).toMatch(/6 dígitos/i);
    expect(validateVerificationCode('abcdef')).toMatch(/6 dígitos/i);
  });
});

describe('payload builders', () => {
  it('builds the contact payload with sanitized lowercase email', () => {
    const payload = buildContactPayload({
      contactType: 'member',
      name: '  Ana  ',
      email: 'ANA@Example.COM ',
      mobile: '',
      talkTitle: '',
      message: 'Hola',
      turnstileToken: '',
    });
    expect(payload).toEqual({
      contactType: 'member',
      name: 'Ana',
      email: 'ana@example.com',
      mobile: '',
      message: 'Hola',
    });
  });

  it('includes talkTitle and turnstileToken only when present', () => {
    const payload = buildContactPayload({
      contactType: 'speaker',
      name: 'Ana',
      email: 'ana@example.com',
      mobile: '',
      talkTitle: 'Mi charla',
      message: 'Hola',
      turnstileToken: 'tok',
    });
    expect(payload.talkTitle).toBe('Mi charla');
    expect(payload.turnstileToken).toBe('tok');
  });

  it('builds the verify payload', () => {
    expect(
      buildVerifyPayload({ contactType: 'member', email: 'Ana@x.com', verificationCode: '123456' })
    ).toEqual({ contactType: 'member', email: 'ana@x.com', token: '123456' });
  });
});

describe('helpers', () => {
  it('masks emails', () => {
    expect(maskEmail('ana.lopez@example.com')).toBe('an***@example.com');
    expect(maskEmail('ab@x.com')).toBe('a***@x.com');
  });

  it('sanitizes control characters and trims', () => {
    expect(sanitizeField('  hola\x00mundo  ')).toBe('holamundo');
    expect(sanitizeField(null)).toBe('');
  });
});
