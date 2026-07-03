import { useEffect, useRef, useState } from 'react';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCommentDots,
  FaLightbulb,
  FaPaperPlane,
  FaShieldAlt,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaCheckCircle,
  FaYoutube,
} from 'react-icons/fa';
import { SiMeetup } from 'react-icons/si';
import TurnstileWidget, { turnstileEnabled } from './components/TurnstileWidget';
import {
  buildContactPayload,
  buildVerifyPayload,
  validateContactForm,
  validateVerificationCode,
  maskEmail,
  sanitizeField,
  LIMITS,
} from './utils/contactFormValidation';
import { SOCIAL_LINKS } from './config/social';
import { MEETUP_LINK } from './config/content';
import './ContactForm.css';

const getApiBase = () => {
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT?.trim();
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

/** Assemble the wizard steps for a persona from its config. */
const buildSteps = (formConfig, wizard) => {
  const steps = [];
  if (formConfig?.showTalkTitle) {
    steps.push({ type: 'talkTitle' });
  }
  if (wizard?.choice) {
    steps.push({ type: 'choice' });
  }
  steps.push({ type: 'message' });
  steps.push({ type: 'contact' });
  return steps;
};

const ContactForm = ({ contactType, formConfig, wizardConfig }) => {
  const requiresTurnstile = turnstileEnabled();
  const wizard = wizardConfig || {};
  const steps = buildSteps(formConfig, wizard);
  const totalSteps = steps.length;

  const stepRef = useRef(null);
  const [phase, setPhase] = useState('wizard'); // wizard | verify | success
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState('fwd');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    talkTitle: '',
    message: '',
  });
  const [choices, setChoices] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [expiresInMinutes, setExpiresInMinutes] = useState(15);
  const [submittedName, setSubmittedName] = useState('');

  const currentStep = steps[stepIndex];

  /* Move focus into each new step so keyboard users stay oriented. */
  useEffect(() => {
    if (phase !== 'wizard') return;
    const el = stepRef.current?.querySelector('input, textarea, button.cw-chip');
    el?.focus?.();
  }, [stepIndex, phase]);

  const clearError = () => setErrorMessage('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError();
  };

  const toggleChoice = (option) => {
    setChoices((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
    clearError();
  };

  /** Message sent to the API: chip selections become a labeled prefix line. */
  const composedMessage = () => {
    const clean = sanitizeField(formData.message);
    if (!choices.length || !wizard.choice) return clean;
    return `${wizard.choice.messageLabel}: ${choices.join(', ')}\n\n${clean}`;
  };

  const validateStep = (step) => {
    switch (step.type) {
      case 'talkTitle': {
        const value = sanitizeField(formData.talkTitle);
        if (!value) return 'Escribe el título o tema de tu charla';
        if (value.length > LIMITS.talkTitle) return 'El título de la charla es demasiado largo';
        return null;
      }
      case 'choice': {
        if (wizard.choice?.required && choices.length === 0) {
          return wizard.choice.requiredError || 'Elige al menos una opción';
        }
        return null;
      }
      case 'message': {
        const value = sanitizeField(formData.message);
        if (!value) return 'Cuéntanos un poco más — este campo es requerido';
        if (value.length > LIMITS.message) return 'El mensaje es demasiado largo';
        return null;
      }
      case 'contact':
        return validateContactForm({
          contactType,
          ...formData,
          message: composedMessage(),
          turnstileToken,
          turnstileRequired: requiresTurnstile,
        });
      default:
        return null;
    }
  };

  const goBack = () => {
    if (stepIndex === 0) return;
    setDirection('back');
    setStepIndex((i) => i - 1);
    clearError();
  };

  const requestCode = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const data = await apiFetch(
        '/contact/request',
        buildContactPayload({
          contactType,
          ...formData,
          message: composedMessage(),
          turnstileToken,
        })
      );
      setExpiresInMinutes(data.expiresInMinutes || 15);
      setVerificationCode('');
      setPhase('verify');
    } catch (error) {
      console.error('Verification request error:', error);
      setErrorMessage(
        error.message || 'Ocurrió un error al solicitar el código. Por favor intenta de nuevo.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepSubmit = (e) => {
    e.preventDefault();
    const validationError = validateStep(currentStep);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    if (currentStep.type === 'contact') {
      requestCode();
      return;
    }
    setDirection('fwd');
    setStepIndex((i) => i + 1);
    clearError();
  };

  const handleCodeChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, LIMITS.verificationCode);
    setVerificationCode(digitsOnly);
    clearError();
  };

  const handleVerifyAndSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateVerificationCode(verificationCode);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await apiFetch(
        '/contact/verify',
        buildVerifyPayload({ contactType, email: formData.email, verificationCode })
      );
      setSubmittedName(sanitizeField(formData.name).split(' ')[0]);
      setPhase('success');
    } catch (error) {
      console.error('Verification error:', error);
      setErrorMessage(error.message || 'No pudimos verificar el código. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (isSubmitting) return;
    if (requiresTurnstile && !turnstileToken) {
      setErrorMessage('Completa la verificación anti-bots antes de reenviar el código.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const data = await apiFetch(
        '/contact/request',
        buildContactPayload({
          contactType,
          ...formData,
          message: composedMessage(),
          turnstileToken,
        })
      );
      setExpiresInMinutes(data.expiresInMinutes || 15);
      setVerificationCode('');
    } catch (error) {
      setErrorMessage(error.message || 'No pudimos reenviar el código. Intenta más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToForm = () => {
    setPhase('wizard');
    setVerificationCode('');
    clearError();
  };

  const startOver = () => {
    setFormData({ name: '', email: '', mobile: '', talkTitle: '', message: '' });
    setChoices([]);
    setVerificationCode('');
    setTurnstileToken('');
    setStepIndex(0);
    setDirection('fwd');
    setPhase('wizard');
    clearError();
  };

  /* ---------- Success ---------- */
  if (phase === 'success') {
    return (
      <div className="cw-success" role="status">
        <FaCheckCircle className="cw-success-icon" aria-hidden />
        <h4 className="cw-success-title">
          {submittedName ? `¡Listo, ${submittedName}!` : '¡Listo!'}
        </h4>
        <p className="cw-success-text">
          Recibimos tu mensaje y te contactaremos pronto. Mientras tanto:
        </p>
        <ul className="cw-success-next">
          <li>
            <a href={MEETUP_LINK} target="_blank" rel="noopener noreferrer">
              <SiMeetup aria-hidden /> Únete al grupo en Meetup
            </a>
          </li>
          <li>
            <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer">
              <FaYoutube aria-hidden /> Mira los webinars grabados
            </a>
          </li>
        </ul>
        <button type="button" className="contact-form-secondary-action" onClick={startOver}>
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  /* ---------- OTP verification ---------- */
  if (phase === 'verify') {
    return (
      <form className="contact-form cw" onSubmit={handleVerifyAndSubmit} noValidate>
        <div className="cw-progress" aria-hidden="true">
          <div className="cw-progress-bar" style={{ width: '100%' }} />
        </div>
        <p className="cw-step-count">Último paso</p>
        <div className="contact-form-header">
          <h4>Confirma tu correo</h4>
          <p className="contact-form-description">
            Enviamos un código de 6 dígitos a {maskEmail(formData.email)}. Revisa tu bandeja
            de entrada (y spam). El código expira en {expiresInMinutes} minutos.
          </p>
        </div>

        {errorMessage && (
          <div className="form-message form-message-error" role="alert">
            {errorMessage}
          </div>
        )}

        <div className="form-group contact-form-field">
          <label htmlFor={`verification-code-${contactType}`}>
            Código de verificación (requerido)
          </label>
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
        </div>

        {requiresTurnstile && (
          <div className="form-group turnstile-group contact-form-field">
            <TurnstileWidget
              onToken={setTurnstileToken}
              onExpire={() => setTurnstileToken('')}
              onError={() => {
                setTurnstileToken('');
                setErrorMessage(
                  'No se pudo cargar la verificación anti-bots. Recarga e intenta de nuevo.'
                );
              }}
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
            Editar respuestas
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

        <button
          type="submit"
          disabled={isSubmitting || verificationCode.length !== LIMITS.verificationCode}
          className={`contact-form-submit ${isSubmitting ? 'submitting' : ''}`}
        >
          <FaCheck className="contact-form-submit-icon" aria-hidden="true" />
          <span>{isSubmitting ? 'Confirmando...' : 'Confirmar y enviar'}</span>
        </button>
      </form>
    );
  }

  /* ---------- Wizard steps ---------- */
  const progressPercent = ((stepIndex + 1) / (totalSteps + 1)) * 100;
  const isLastStep = currentStep.type === 'contact';

  const renderStepBody = () => {
    switch (currentStep.type) {
      case 'talkTitle':
        return (
          <>
            <h4 className="cw-step-title">{wizard.talkTitle?.title || '¿De qué quieres hablar?'}</h4>
            {wizard.talkTitle?.subtitle && (
              <p className="cw-step-subtitle">{wizard.talkTitle.subtitle}</p>
            )}
            <div className="form-input-wrap">
              <FaLightbulb className="form-input-icon" aria-hidden="true" />
              <input
                type="text"
                id={`talk-title-${contactType}`}
                name="talkTitle"
                value={formData.talkTitle}
                onChange={handleChange}
                placeholder={formConfig?.talkTitlePlaceholder || 'Nombre de tu charla o taller'}
                maxLength={LIMITS.talkTitle}
                aria-label={formConfig?.talkTitleLabel || 'Título de la charla'}
                disabled={isSubmitting}
              />
            </div>
            {wizard.reachNote && <p className="cw-reach-note">{wizard.reachNote}</p>}
          </>
        );
      case 'choice':
        return (
          <>
            <h4 className="cw-step-title">{wizard.choice.title}</h4>
            {wizard.choice.subtitle && <p className="cw-step-subtitle">{wizard.choice.subtitle}</p>}
            <div className="cw-chips" role="group" aria-label={wizard.choice.title}>
              {wizard.choice.options.map((option) => {
                const selected = choices.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    className={`cw-chip ${selected ? 'cw-chip--selected' : ''}`}
                    aria-pressed={selected}
                    onClick={() => toggleChoice(option)}
                    disabled={isSubmitting}
                  >
                    {selected && <FaCheck aria-hidden />}
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>
            {wizard.reachNote && <p className="cw-reach-note">{wizard.reachNote}</p>}
          </>
        );
      case 'message':
        return (
          <>
            {wizard.messageLead && <p className="cw-lead">{wizard.messageLead}</p>}
            <h4 className="cw-step-title">
              {formConfig?.messageLabel || 'Cuéntanos más (requerido)'}
            </h4>
            <div className="form-input-wrap form-input-wrap--textarea">
              <FaCommentDots
                className="form-input-icon form-input-icon--textarea"
                aria-hidden="true"
              />
              <textarea
                id={`mensaje-${contactType}`}
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder={formConfig?.messagePlaceholder || 'Escribe tu mensaje...'}
                maxLength={LIMITS.message}
                aria-label={formConfig?.messageLabel || 'Mensaje'}
                disabled={isSubmitting}
              />
            </div>
          </>
        );
      case 'contact':
        return (
          <>
            {wizard.contactLead && <p className="cw-lead">{wizard.contactLead}</p>}
            <h4 className="cw-step-title">Tus datos de contacto</h4>
            <div className="form-group contact-form-field">
              <label htmlFor={`nombre-${contactType}`}>Nombre completo (requerido)</label>
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
            </div>
            <div className="form-group contact-form-field">
              <label htmlFor={`email-${contactType}`}>Correo electrónico (requerido)</label>
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
            </div>
            <div className="form-group contact-form-field">
              <label htmlFor={`mobile-${contactType}`}>Número de teléfono (opcional)</label>
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
            </div>
            {requiresTurnstile && (
              <div className="form-group turnstile-group contact-form-field">
                <TurnstileWidget
                  onToken={setTurnstileToken}
                  onExpire={() => setTurnstileToken('')}
                  onError={() => {
                    setTurnstileToken('');
                    setErrorMessage(
                      'No se pudo cargar la verificación anti-bots. Recarga e intenta de nuevo.'
                    );
                  }}
                />
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <form className="contact-form cw" onSubmit={handleStepSubmit} noValidate>
      <div className="cw-progress" aria-hidden="true">
        <div className="cw-progress-bar" style={{ width: `${progressPercent}%` }} />
      </div>
      <p className="cw-step-count">
        Paso {stepIndex + 1} de {totalSteps}
      </p>

      {errorMessage && (
        <div className="form-message form-message-error" role="alert">
          {errorMessage}
        </div>
      )}

      <div
        key={stepIndex}
        ref={stepRef}
        className={`cw-step cw-step--${direction}`}
        aria-live="polite"
      >
        {renderStepBody()}
      </div>

      <div className="cw-nav">
        {stepIndex > 0 ? (
          <button
            type="button"
            className="contact-form-secondary-action cw-back"
            onClick={goBack}
            disabled={isSubmitting}
          >
            <FaArrowLeft aria-hidden /> <span>Atrás</span>
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={isSubmitting || (isLastStep && requiresTurnstile && !turnstileToken)}
          className={`contact-form-submit cw-next ${isSubmitting ? 'submitting' : ''}`}
        >
          {isLastStep ? (
            <>
              <FaPaperPlane className="contact-form-submit-icon" aria-hidden="true" />
              <span>
                {isSubmitting
                  ? 'Enviando código...'
                  : formConfig?.submitLabel || 'Enviar mensaje'}
              </span>
            </>
          ) : (
            <>
              <span>Continuar</span>
              <FaArrowRight className="contact-form-submit-icon" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
