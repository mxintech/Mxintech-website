import React, { useState, useRef, useEffect } from 'react';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCommentDots,
  FaLightbulb,
  FaPaperPlane,
} from 'react-icons/fa';
import TurnstileWidget, { turnstileEnabled } from './components/TurnstileWidget';
import {
  buildContactPayload,
  validateContactForm,
  LIMITS,
} from './utils/contactFormValidation';
import './ContactForm.css';

const ContactForm = ({ contactType, formConfig, animated = false }) => {
  const successTimeoutRef = useRef(null);
  const requiresTurnstile = turnstileEnabled();
  const showTalkTitle = Boolean(formConfig?.showTalkTitle);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    talkTitle: '',
    message: '',
  });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (submitStatus === 'error') {
      setSubmitStatus(null);
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateContactForm({
      contactType,
      ...formData,
      turnstileToken,
      turnstileRequired: requiresTurnstile,
    });

    if (validationError) {
      setSubmitStatus('error');
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT?.trim();
    const placeholderPattern = /your-api-endpoint\.execute-api\.region\.amazonaws\.com/i;
    const isValidApiEndpoint =
      apiEndpoint &&
      apiEndpoint !== 'None' &&
      !placeholderPattern.test(apiEndpoint) &&
      /^https?:\/\//i.test(apiEndpoint);
    if (!isValidApiEndpoint) {
      setIsSubmitting(false);
      setSubmitStatus('error');
      setErrorMessage('El formulario no está configurado. Por favor contacte al administrador.');
      return;
    }

    const contactUrl = `${apiEndpoint.replace(/\/+$/, '')}/contact`;

    try {
      const response = await fetch(contactUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'MxintechWebsite',
        },
        body: JSON.stringify(
          buildContactPayload({
            contactType,
            ...formData,
            turnstileToken,
          })
        ),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('El servicio de contacto no está disponible. Intenta más tarde.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar el formulario');
      }

      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        mobile: '',
        talkTitle: '',
        message: '',
      });
      setTurnstileToken('');

      successTimeoutRef.current = setTimeout(() => {
        setSubmitStatus(null);
        successTimeoutRef.current = null;
      }, 5000);
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Ocurrió un error al enviar el formulario. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (index, label, id, children) => (
    <div
      className={`form-group contact-form-field ${animated ? 'contact-form-field--animated' : ''}`}
      style={animated ? { animationDelay: `${0.15 + index * 0.07}s` } : undefined}
    >
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );

  return (
    <form
      className={`contact-form ${animated ? 'contact-form--visible' : ''}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="contact-form-header contact-form-field contact-form-field--animated" style={{ animationDelay: '0.05s' }}>
        <h4>{formConfig?.title || 'Envíanos un mensaje'}</h4>
        {formConfig?.description && (
          <p className="contact-form-description">{formConfig.description}</p>
        )}
      </div>

      {submitStatus === 'success' && (
        <div className="form-message form-message-success" role="status">
          ¡Mensaje enviado exitosamente! Te contactaremos pronto.
        </div>
      )}

      {submitStatus === 'error' && errorMessage && (
        <div className="form-message form-message-error" role="alert">
          {errorMessage}
        </div>
      )}

      {renderField(
        0,
        'Nombre completo (requerido)',
        `nombre-${contactType}`,
        <div className="form-input-wrap">
          <FaUser className="form-input-icon" aria-hidden="true" />
          <input
            type="text"
            id={`nombre-${contactType}`}
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Tu nombre completo"
            maxLength={LIMITS.name}
            autoComplete="name"
            required
            aria-required="true"
            disabled={isSubmitting}
          />
        </div>
      )}

      {renderField(
        1,
        'Correo electrónico (requerido)',
        `email-${contactType}`,
        <div className="form-input-wrap">
          <FaEnvelope className="form-input-icon" aria-hidden="true" />
          <input
            type="email"
            id={`email-${contactType}`}
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@correo.com"
            maxLength={LIMITS.email}
            autoComplete="email"
            required
            aria-required="true"
            disabled={isSubmitting}
          />
        </div>
      )}

      {renderField(
        2,
        'Número de teléfono (opcional)',
        `mobile-${contactType}`,
        <div className="form-input-wrap">
          <FaPhone className="form-input-icon" aria-hidden="true" />
          <input
            type="tel"
            id={`mobile-${contactType}`}
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="+52 123 456 7890"
            maxLength={LIMITS.mobile}
            autoComplete="tel"
            disabled={isSubmitting}
          />
        </div>
      )}

      {showTalkTitle &&
        renderField(
          3,
          formConfig.talkTitleLabel || 'Título de la charla (requerido)',
          `talk-title-${contactType}`,
          <div className="form-input-wrap">
            <FaLightbulb className="form-input-icon" aria-hidden="true" />
            <input
              type="text"
              id={`talk-title-${contactType}`}
              name="talkTitle"
              value={formData.talkTitle}
              onChange={handleChange}
              placeholder={formConfig.talkTitlePlaceholder || 'Nombre de tu charla o taller'}
              maxLength={LIMITS.talkTitle}
              required
              aria-required="true"
              disabled={isSubmitting}
            />
          </div>
        )}

      {renderField(
        showTalkTitle ? 4 : 3,
        formConfig?.messageLabel || 'Mensaje (requerido)',
        `mensaje-${contactType}`,
        <div className="form-input-wrap form-input-wrap--textarea">
          <FaCommentDots className="form-input-icon form-input-icon--textarea" aria-hidden="true" />
          <textarea
            id={`mensaje-${contactType}`}
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            placeholder={formConfig?.messagePlaceholder || 'Escribe tu mensaje...'}
            maxLength={LIMITS.message}
            required
            aria-required="true"
            disabled={isSubmitting}
          />
        </div>
      )}

      {requiresTurnstile && (
        <div
          className={`form-group turnstile-group contact-form-field ${animated ? 'contact-form-field--animated' : ''}`}
          style={animated ? { animationDelay: `${0.15 + (showTalkTitle ? 5 : 4) * 0.07}s` } : undefined}
        >
          <TurnstileWidget
            onToken={setTurnstileToken}
            onExpire={() => setTurnstileToken('')}
            onError={() => {
              setTurnstileToken('');
              setSubmitStatus('error');
              setErrorMessage('No se pudo cargar la verificación anti-bots. Recarga e intenta de nuevo.');
            }}
          />
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || (requiresTurnstile && !turnstileToken)}
        className={`contact-form-submit ${isSubmitting ? 'submitting' : ''} ${
          animated ? 'contact-form-field contact-form-field--animated' : ''
        }`}
        style={animated ? { animationDelay: `${0.15 + (showTalkTitle ? 6 : 5) * 0.07}s` } : undefined}
      >
        <FaPaperPlane className="contact-form-submit-icon" aria-hidden="true" />
        <span>{isSubmitting ? 'Enviando...' : formConfig?.submitLabel || 'Enviar mensaje'}</span>
      </button>
    </form>
  );
};

export default ContactForm;
