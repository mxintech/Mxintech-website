export const CONTACT_TYPES = ['member', 'leader', 'speaker', 'business'];

export const LIMITS = {
  name: 100,
  email: 254,
  mobile: 20,
  message: 2000,
};

const NAME_PATTERN = /^[\w\s'.À-ÿñÑ-]{2,100}$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,254}$/;
const PHONE_PATTERN = /^\+?[\d\s().-]{7,20}$/;
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
  if (!cleanMobile) return 'El número de teléfono es requerido';
  if (cleanMobile.length > LIMITS.mobile) return 'El teléfono es demasiado largo';
  if (!PHONE_PATTERN.test(cleanMobile)) return 'Por favor ingresa un teléfono válido';

  const cleanMessage = sanitizeField(message);
  if (!cleanMessage) return 'El mensaje es requerido';
  if (cleanMessage.length > LIMITS.message) return 'El mensaje es demasiado largo';
  if (SCRIPT_PATTERN.test(cleanMessage)) return 'El mensaje contiene contenido no permitido';

  if (turnstileRequired && !sanitizeField(turnstileToken)) {
    return 'Completa la verificación anti-bots antes de continuar';
  }

  return null;
};

export const buildContactPayload = ({
  contactType,
  name,
  email,
  mobile,
  message,
  turnstileToken,
}) => ({
  contactType,
  name: sanitizeField(name),
  email: sanitizeField(email).toLowerCase(),
  mobile: sanitizeField(mobile),
  message: sanitizeField(message),
  ...(turnstileToken ? { turnstileToken: sanitizeField(turnstileToken) } : {}),
});
