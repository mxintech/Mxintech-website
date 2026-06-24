export const CONTACT_TYPES = ['member', 'leader', 'speaker', 'business'];

export const LIMITS = {
  name: 100,
  email: 254,
  mobile: 20,
  talkTitle: 200,
  message: 2000,
  verificationCode: 6,
};

const NAME_PATTERN = /^[\w\s'.À-ÿñÑ-]{2,100}$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,254}$/;
const PHONE_PATTERN = /^\+?[\d\s().-]{7,20}$/;
const OTP_PATTERN = /^\d{6}$/;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;
const SCRIPT_PATTERN = /<\s*\/?\s*script|javascript:|on\w+\s*=/i;

export const sanitizeField = (value) =>
  String(value ?? '').replace(CONTROL_CHARS, '').trim();

export const validateContactForm = ({
  contactType,
  name,
  email,
  mobile,
  talkTitle,
  message,
  turnstileToken,
  turnstileRequired,
}) => {
  if (!CONTACT_TYPES.includes(contactType)) {
    return 'Tipo de contacto inválido';
  }

  const cleanName = sanitizeField(name);
  if (!cleanName) return 'El nombre es requerido';
  if (cleanName.length > LIMITS.name) return 'El nombre es demasiado largo';
  if (!NAME_PATTERN.test(cleanName)) return 'El nombre contiene caracteres no permitidos';
  if (SCRIPT_PATTERN.test(cleanName)) return 'El nombre contiene contenido no permitido';

  const cleanEmail = sanitizeField(email).toLowerCase();
  if (!cleanEmail) return 'El correo electrónico es requerido';
  if (cleanEmail.length > LIMITS.email) return 'El correo electrónico es demasiado largo';
  if (!EMAIL_PATTERN.test(cleanEmail)) return 'Por favor ingresa un correo electrónico válido';

  const cleanMobile = sanitizeField(mobile);
  if (cleanMobile) {
    if (cleanMobile.length > LIMITS.mobile) return 'El teléfono es demasiado largo';
    if (!PHONE_PATTERN.test(cleanMobile)) return 'Por favor ingresa un teléfono válido';
  }

  const cleanTalkTitle = sanitizeField(talkTitle);
  if (contactType === 'speaker') {
    if (!cleanTalkTitle) return 'El título de la charla es requerido';
    if (cleanTalkTitle.length > LIMITS.talkTitle) return 'El título de la charla es demasiado largo';
    if (SCRIPT_PATTERN.test(cleanTalkTitle)) return 'El título contiene contenido no permitido';
  } else if (cleanTalkTitle) {
    if (cleanTalkTitle.length > LIMITS.talkTitle) return 'El título de la charla es demasiado largo';
    if (SCRIPT_PATTERN.test(cleanTalkTitle)) return 'El título contiene contenido no permitido';
  }

  const cleanMessage = sanitizeField(message);
  if (!cleanMessage) return 'El mensaje es requerido';
  if (cleanMessage.length > LIMITS.message) return 'El mensaje es demasiado largo';
  if (SCRIPT_PATTERN.test(cleanMessage)) return 'El mensaje contiene contenido no permitido';

  if (turnstileRequired && !sanitizeField(turnstileToken)) {
    return 'Completa la verificación anti-bots antes de continuar';
  }

  return null;
};

export const validateVerificationCode = (code) => {
  const cleanCode = sanitizeField(code);
  if (!cleanCode) return 'Ingresa el código de verificación';
  if (!OTP_PATTERN.test(cleanCode)) return 'El código debe tener 6 dígitos';
  return null;
};

export const buildContactPayload = ({
  contactType,
  name,
  email,
  mobile,
  talkTitle,
  message,
  turnstileToken,
}) => ({
  contactType,
  name: sanitizeField(name),
  email: sanitizeField(email).toLowerCase(),
  mobile: sanitizeField(mobile),
  ...(sanitizeField(talkTitle) ? { talkTitle: sanitizeField(talkTitle) } : {}),
  message: sanitizeField(message),
  ...(turnstileToken ? { turnstileToken: sanitizeField(turnstileToken) } : {}),
});

export const buildVerifyPayload = ({ contactType, email, verificationCode }) => ({
  contactType,
  email: sanitizeField(email).toLowerCase(),
  token: sanitizeField(verificationCode),
});

export const maskEmail = (email) => {
  const clean = sanitizeField(email).toLowerCase();
  const [local, domain] = clean.split('@');
  if (!local || !domain) return clean;
  if (local.length <= 2) return `${local[0] || '*'}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
};
