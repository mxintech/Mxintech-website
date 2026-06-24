import { BRAND } from './brand';
import {
  FaUserPlus,
  FaUserTie,
  FaMicrophone,
  FaHandshake,
  FaGraduationCap,
  FaBell,
  FaUsers,
  FaRocket,
  FaCalendarCheck,
  FaBullhorn,
  FaPenFancy,
  FaChartLine,
  FaLightbulb,
  FaAward,
  FaBuilding,
  FaGift,
  FaDoorOpen,
  FaHandsHelping,
} from 'react-icons/fa';

/**
 * Copy, benefits, and form settings for each contact profile.
 * See also [brand colors](../brand/README.md) for official palette tokens.
 */
export const CONTACT_FORMS = {
  member: {
    contactType: 'member',
    icon: FaUserPlus,
    accent: BRAND.primary.blue,
    headline: 'Únete como miembro',
    tagline: 'Aprende, crece y mantente al día con la comunidad tech',
    intro:
      'Ideal si quieres seguir aprendiendo, impulsar tu carrera profesional y enterarte primero de lo que pasa en México in Tech.',
    benefits: [
      {
        icon: FaGraduationCap,
        title: 'Aprendizaje continuo',
        text: 'Accede a webinars, talleres y recursos para desarrollar tus habilidades técnicas.',
      },
      {
        icon: FaBell,
        title: 'Eventos y cursos',
        text: 'Recibe avisos de nuevos eventos, cursos y oportunidades de la comunidad.',
      },
      {
        icon: FaUsers,
        title: 'Red profesional',
        text: 'Conecta con personas que comparten tus intereses en cloud, DevOps y más.',
      },
      {
        icon: FaRocket,
        title: 'Impulsa tu carrera',
        text: 'Participa en un ecosistema activo del AWS User Group Tlaxcala y comunidades tech en México.',
      },
    ],
    form: {
      title: 'Regístrate como miembro',
      description:
        'Cuéntanos un poco sobre ti. Te avisaremos cuando haya eventos, cursos y actividades para ti.',
      submitLabel: 'Quiero ser miembro',
      messageLabel: '¿Por qué quieres unirte? (requerido)',
      messagePlaceholder:
        'Ej.: Me interesa cloud y quiero asistir a webinars y conocer a más desarrolladores…',
    },
  },
  leader: {
    contactType: 'leader',
    icon: FaUserTie,
    accent: BRAND.primary.pink,
    headline: 'Conviértete en líder',
    tagline: 'Da el siguiente paso: de espectador a impulsor de la comunidad',
    intro:
      'Para quienes quieren dejar de ser solo audiencia y contribuir activamente al crecimiento de México in Tech.',
    benefits: [
      {
        icon: FaCalendarCheck,
        title: 'Organiza eventos',
        text: 'Ayuda a planear meetups, webinars y actividades presenciales o en línea.',
      },
      {
        icon: FaBullhorn,
        title: 'Difunde la comunidad',
        text: 'Comparte eventos en tus redes y acerca la comunidad a más personas.',
      },
      {
        icon: FaPenFancy,
        title: 'Genera contenido',
        text: 'Colabora en ideas, materiales y experiencias que inspiren a otros.',
      },
      {
        icon: FaChartLine,
        title: 'Haz crecer la comunidad',
        text: 'Contribuye en una o varias áreas: operación, contenido, outreach o mentoring.',
      },
    ],
    form: {
      title: 'Solicitud para ser líder',
      description:
        'Cuéntanos cómo te gustaría aportar. No necesitas experiencia previa organizando — lo importante es tu entusiasmo.',
      submitLabel: 'Quiero ser líder',
      messageLabel: '¿Cómo te gustaría contribuir? (requerido)',
      messagePlaceholder:
        'Ej.: Me gustaría ayudar a organizar meetups, moderar webinars o apoyar con difusión en LinkedIn…',
    },
  },
  speaker: {
    contactType: 'speaker',
    icon: FaMicrophone,
    accent: BRAND.secondary.cyan,
    headline: 'Comparte como speaker',
    tagline: 'Tu experiencia técnica puede inspirar a toda la comunidad',
    intro:
      'Si dominas un tema y quieres compartirlo en charlas, talleres o webinars, este es tu espacio.',
    benefits: [
      {
        icon: FaLightbulb,
        title: 'Comparte conocimiento',
        text: 'Presenta temas de cloud, AWS, Kubernetes, desarrollo u otras áreas técnicas.',
      },
      {
        icon: FaUsers,
        title: 'Impacto real',
        text: 'Llega a desarrolladores, estudiantes y profesionales que buscan aprender.',
      },
      {
        icon: FaAward,
        title: 'Visibilidad',
        text: 'Destaca tu experiencia dentro de una comunidad tech activa en México.',
      },
      {
        icon: FaMicrophone,
        title: 'Formatos flexibles',
        text: 'Charlas cortas, talleres prácticos o sesiones en vivo — adaptamos el formato contigo.',
      },
    ],
    form: {
      title: 'Propón tu charla',
      description:
        'Indica el tema que te gustaría presentar y cuéntanos tu experiencia. Revisaremos tu propuesta y te contactaremos.',
      submitLabel: 'Enviar propuesta',
      messageLabel: 'Experiencia y enfoque de la charla (requerido)',
      messagePlaceholder:
        'Ej.: 5 años en AWS, me gustaría hablar de arquitecturas serverless para equipos pequeños…',
      showTalkTitle: true,
      talkTitleLabel: 'Título de la charla (requerido)',
      talkTitlePlaceholder: 'Ej.: Introducción a EKS para equipos que empiezan en Kubernetes',
    },
  },
  business: {
    contactType: 'business',
    icon: FaHandshake,
    accent: BRAND.secondary.green,
    headline: 'Empresas y colaboraciones',
    tagline: 'Apoya la comunidad tech y conecta con talento en México',
    intro:
      'Si representas una empresa o institución, puedes patrocinar, colaborar o explorar alianzas con México in Tech.',
    benefits: [
      {
        icon: FaBuilding,
        title: 'Patrocinio y visibilidad',
        text: 'Apoya eventos y webinars mientras conectas tu marca con la comunidad tech.',
      },
      {
        icon: FaDoorOpen,
        title: 'Espacios para meetups',
        text: 'Ofrece sede para reuniones, talleres o networking presencial.',
      },
      {
        icon: FaGift,
        title: 'Swag y becas',
        text: 'Contribuye con merchandising, becas o acceso a cursos para miembros.',
      },
      {
        icon: FaHandsHelping,
        title: 'Colaboraciones abiertas',
        text: 'Invitaciones a eventos tech, alianzas con instituciones u otras formas de apoyo mutuo.',
      },
    ],
    form: {
      title: 'Contacto empresarial',
      description:
        'Cuéntanos cómo te gustaría colaborar: patrocinio, sede, swag, cursos, invitaciones o propuestas conjuntas.',
      submitLabel: 'Enviar solicitud',
      messageLabel: 'Detalle de tu propuesta (requerido)',
      messagePlaceholder:
        'Ej.: Somos [empresa]. Podemos ofrecer sede para meetups y patrocinar coffee breaks en eventos…',
    },
  },
};

export const getContactFormConfig = (contactType) =>
  CONTACT_FORMS[contactType] ?? null;
