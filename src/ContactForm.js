import React, { useState, useRef, useEffect } from 'react';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCommentDots,
  FaLightbulb,
  FaPaperPlane,
  FaShieldAlt,
} from 'react-icons/fa';
import TurnstileWidget, { turnstileEnabled } from './components/TurnstileWidget';
import {
  buildContactPayload,
  buildVerifyPayload,
  validateContactForm,
  validateVerificationCode,
  maskEmail,
  LIMITS,
} from './utils/contactFormValidation';
import './ContactForm.css';

const getApiBase = () => {
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT?.trim();
  const placeholderPattern = /your-api-endpoint\.execute-api\.region\.amazonaws\.com/i;
  const isValidApiEndpoint =
    apiEndpoint &&
    apiEndpoint !== 'None' &&
    !placeholderPattern.test(apiEndpoint) &&
    /^https?:\/\//i.test(apiEndpoint);

  if (!isValidApiEndpoint) return null;
  return apiEndpoint.replace(/\/+$/, '');
};

const apiFetch = async (path, body) => {
  const base = getApiBase();
  if (!base) {
    throw new Error('El formulario no está configurado. Por favor contacte al administrador.');
  }

  const response = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'MxintechWebsite',
    },
    body: JSON.stringify(body),
  });

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('El servicio de contacto no está disponible. Intenta más tarde.');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Error al enviar el formulario');
  }

  return data;
};

const ContactForm = ({ contactType, formConfig, animated = false }) => {
  const successTimeoutRef = useRef(null);
  const requiresTurnstile = turnstileEnabled();
  const showTalkTitle = Boolean(formConfig?.showTalkTitle);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    talkTitle: '',
    message: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [expiresInMinutes, setExpiresInMinutes] = useState(15);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      talkTitle: '',
      message: '',
    });
    setVerificationCode('');
    setTurnstileToken('');
    setStep('form');
  };

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

  const handleCodeChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, LIMITS.verificationCode);
    setVerificationCode(digitsOnly);
    if (submitStatus === 'error') {
      setSubmitStatus(null);
      setErrorMessage('');
    }
  };

  const handleRequestCode = async (e) => {
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

    try {
      const data = await apiFetch('/contact/request', buildContactPayload({
        contactType,
        ...formData,
        turnstileToken,
      }));

      setExpiresInMinutes(data.expiresInMinutes || 15);
      setVerificationCode('');
      setStep('verify');
      setSubmitStatus('info');
      setErrorMessage('');
    } catch (error) {
      console.error('Verification request error:', error);
      setSubmitStatus('error');
      setErrorMessage(error.message || 'Ocurrió un error al solicitar el código. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAndSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateVerificationCode(verificationCode);
    if (validationError) {
      setSubmitStatus('error');
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      await apiFetch('/contact/verify', buildVerifyPayload({
        contactType,
        email: formData.email,
        verificationCode,
      }));

      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      setSubmitStatus('success');
      resetForm();

      successTimeoutRef.current = setTimeout(() => {
        setSubmitStatus(null);
        successTimeoutRef.current = null;
      }, 5000);
    } catch (error) {
      console.error('Verification error:', error);
      setSubmitStatus('error');
      setErrorMessage(error.message || 'No pudimos verificar el código. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (isSubmitting) return;

    if (requiresTurnstile && !turnstileToken) {
      setSubmitStatus('error');
      setErrorMessage('Completa la verificación anti-bots antes de reenviar el código.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');

    try {
      const data = await apiFetch('/contact/request', buildContactPayload({
        contactType,
        ...formData,
        turnstileToken,
      }));

      setExpiresInMinutes(data.expiresInMinutes || 15);
      setVerificationCode('');
      setSubmitStatus('info');
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error.message || 'No pudimos reenviar el código. Intenta más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToForm = () => {
    setStep('form');
    setVerificationCode('');
    setSubmitStatus(null);
    setErrorMessage('');
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

  const fieldsDisabled = isSubmitting || step === 'verify';

  return (
    <form
      className={`contact-form ${animated ? 'contact-form--visible' : ''}`}
      onSubmit={step === 'verify' ? handleVerifyAndSubmit : handleRequestCode}
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

      {submitStatus === 'info' && step === 'verify' && (
        <div className="form-message form-message-info" role="status">
          Enviamos un código de 6 dígitos a {maskEmail(formData.email)}. Revisa tu bandeja de entrada
          (y spam). El código expira en {expiresInMinutes} minutos.
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
            disabled={fieldsDisabled}
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
            disabled={fieldsDisabled}
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
            disabled={fieldsDisabled}
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
              disabled={fieldsDisabled}
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
            disabled={fieldsDisabled}
          />
        </div>
      )}

      {step === 'verify' && requiresTurnstile && (
        <div className="form-group turnstile-group contact-form-field">
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

      {step === 'verify' && (
        <>
          {renderField(
            showTalkTitle ? 5 : 4,
            'Código de verificación (requerido)',
            `verification-code-${contactType}`,
            <div className="form-input-wrap">
              <FaShieldAlt className="form-input-icon" aria-hidden="true" />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                id={`verification-code-${contactType}`}
                name="verificationCode"
                value={verificationCode}
                onChange={handleCodeChange}
                placeholder="000000"
                maxLength={LIMITS.verificationCode}
                pattern="\d{6}"
                required
                aria-required="true"
                disabled={isSubmitting}
                className="contact-form-otp-input"
              />
            </div>
          )}

          <div className="contact-form-verify-actions">
            <button
              type="button"
              className="contact-form-secondary-action"
              onClick={handleBackToForm}
              disabled={isSubmitting}
            >
              Editar formulario
            </button>
            <button
              type="button"
              className="contact-form-secondary-action"
              onClick={handleResendCode}
              disabled={isSubmitting}
            >
              Reenviar código
            </button>
          </div>
        </>
      )}

      {step === 'form' && requiresTurnstile && (
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
        disabled={
          isSubmitting ||
          (step === 'form' && requiresTurnstile && !turnstileToken) ||
          (step === 'verify' && verificationCode.length !== LIMITS.verificationCode)
        }
        className={`contact-form-submit ${isSubmitting ? 'submitting' : ''} ${
          animated ? 'contact-form-field contact-form-field--animated' : ''
        }`}
        style={animated ? { animationDelay: `${0.15 + (showTalkTitle ? 6 : 5) * 0.07}s` } : undefined}
      >
        <FaPaperPlane className="contact-form-submit-icon" aria-hidden="true" />
        <span>
          {isSubmitting
            ? step === 'verify'
              ? 'Confirmando...'
              : 'Enviando código...'
            : step === 'verify'
              ? 'Confirmar y enviar'
              : formConfig?.submitLabel || 'Enviar mensaje'}
        </span>
      </button>
    </form>
  );
};

export default ContactForm;
