import React, { useState, useRef, useEffect } from 'react';
import TurnstileWidget, { turnstileEnabled } from './components/TurnstileWidget';
import {
  buildContactPayload,
  validateContactForm,
  LIMITS,
} from './utils/contactFormValidation';
import './ContactForm.css';

const ContactForm = ({ contactType, title, description }) => {
  const successTimeoutRef = useRef(null);
  const requiresTurnstile = turnstileEnabled();

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
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

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <h4>{title || 'Envíanos un mensaje'}</h4>
      {description && <p className="contact-form-description">{description}</p>}

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

      <div className="form-group">
        <label htmlFor={`nombre-${contactType}`}>Nombre completo:</label>
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
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor={`email-${contactType}`}>Correo electrónico:</label>
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
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor={`mobile-${contactType}`}>Número de teléfono (opcional):</label>
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

      <div className="form-group">
        <label htmlFor={`mensaje-${contactType}`}>Mensaje:</label>
        <textarea
          id={`mensaje-${contactType}`}
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows="5"
          placeholder="Escribe tu mensaje..."
          maxLength={LIMITS.message}
          required
          disabled={isSubmitting}
        />
      </div>

      {requiresTurnstile && (
        <div className="form-group turnstile-group">
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
        className={isSubmitting ? 'submitting' : ''}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
      </button>
    </form>
  );
};

export default ContactForm;
