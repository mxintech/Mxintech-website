import { BRAND } from './brand';
import { SOCIAL_LINKS } from './social';
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
 * See docs/contact-forms/README.md for product intent and maintenance notes.
 * Brand colors: docs/brand/README.md and src/config/brand.js
 */
export const CONTACT_FORMS = {
  member: {
    contactType: 'member',
    icon: FaUserPlus,
    accent: BRAND.primary.blue,
    headline: 'Únete como miembro',
    tagline: 'Aprende, crece y mantente al día con la comunidad tech',
    image: {
      src: '/img/member.jpg',
      alt: 'Desarrolladores colaborando en equipo con sus laptops',
    },
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
    wizard: {
      choice: {
        title: '¿Qué te gustaría aprender?',
        subtitle: 'Elige uno o varios temas — así te avisamos de lo que sí te interesa.',
        messageLabel: 'Intereses',
        options: [
          'Cloud & AWS',
          'DevOps & Kubernetes',
          'Desarrollo de software',
          'IA y datos',
          'Carrera profesional',
        ],
        required: false,
      },
      messageLead: '¡Buena elección! Cuéntanos qué te motiva a unirte.',
      contactLead: 'Último paso: ¿a dónde te avisamos de eventos y cursos?',
    },
  },
  leader: {
    contactType: 'leader',
    icon: FaUserTie,
    accent: BRAND.primary.pink,
    headline: 'Conviértete en líder',
    tagline: 'Da el siguiente paso: de espectador a impulsor de la comunidad',
    image: {
      src: '/img/leader.jpg',
      alt: 'Una líder de comunidad presentando frente a su audiencia',
    },
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
    wizard: {
      choice: {
        title: '¿En qué área te gustaría hacer que las cosas pasen?',
        subtitle: 'Elige una o varias — no necesitas experiencia previa, solo ganas.',
        messageLabel: 'Áreas de contribución',
        options: [
          'Organizar eventos',
          'Crear contenido',
          'Difusión en redes',
          'Mentoring y charlas',
          'Operación y logística',
        ],
        required: true,
        requiredError: 'Elige al menos un área para continuar',
      },
      messageLead: '¡Eso es actitud! Cuéntanos un poco de ti y de tu experiencia.',
      contactLead: 'Último paso: ¿cómo te contactamos para darte la bienvenida al equipo?',
    },
    /* Eligibility bar for the leader role (CNCF-ambassador style):
       shown as a checklist on the page and confirmed step by step in the wizard. */
    requirements: {
      title: 'Requisitos para ser líder',
      confirmTitle: 'Confirma que cumples los requisitos',
      confirmLead: 'Ser líder es un rol de confianza — revisa que cumples con esto:',
      items: [
        {
          id: 'membership',
          text: 'Llevar al menos 3 meses como miembro de la comunidad',
          confirm: 'Llevo al menos 3 meses como miembro de la comunidad',
        },
        {
          id: 'posts',
          text: 'Haber compartido al menos 3 publicaciones tech en el canal de Telegram',
          confirm: 'He compartido al menos 3 publicaciones tech en el canal de Telegram',
          href: SOCIAL_LINKS.telegram,
          hrefLabel: 'Abrir el canal de Telegram',
        },
        {
          id: 'age',
          text: 'Tener al menos 18 años',
          confirm: 'Tengo 18 años o más',
        },
        {
          id: 'standards',
          text: 'Aceptar los Estándares de Líderes',
          confirm: 'Leí y acepto los Estándares de Líderes',
          href: '/lideres/estandares',
          hrefLabel: 'Leer los estándares',
        },
      ],
    },
  },
  speaker: {
    contactType: 'speaker',
    icon: FaMicrophone,
    accent: BRAND.secondary.cyan,
    headline: 'Comparte como speaker',
    tagline: 'Tu experiencia técnica puede inspirar a toda la comunidad',
    image: {
      src: '/img/speaker.jpg',
      alt: 'Un speaker compartiendo una charla técnica con la comunidad',
    },
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
    wizard: {
      talkTitle: {
        title: '¿De qué te gustaría hablar?',
        subtitle: 'No tiene que ser perfecto — afinamos el título contigo.',
      },
      messageLead: '¡Suena genial! Cuéntanos tu experiencia y el enfoque que le darías.',
      contactLead: 'Ya casi: ¿cómo te contactamos para agendar tu charla?',
      reachNote: 'Tu charla puede llegar a toda la comunidad: se transmite en vivo y queda grabada en YouTube.',
    },
  },
  business: {
    contactType: 'business',
    icon: FaHandshake,
    accent: BRAND.secondary.green,
    headline: 'Empresas y colaboraciones',
    image: {
      src: '/img/apoyo-empresas.jpg',
      alt: 'Manos entrelazadas de un equipo sellando una alianza',
    },
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
    wizard: {
      choice: {
        title: '¿Cómo le gustaría colaborar a tu organización?',
        subtitle: 'Elige una o varias formas de colaboración.',
        messageLabel: 'Tipo de colaboración',
        options: [
          'Patrocinio de eventos',
          'Sede para meetups',
          'Swag y becas',
          'Cursos y contenido',
          'Alianza institucional',
        ],
        required: true,
        requiredError: 'Elige al menos una forma de colaboración',
      },
      messageLead: 'Excelente. Cuéntanos los detalles de tu propuesta.',
      contactLead: 'Último paso: ¿con quién coordinamos la colaboración?',
      reachNote: 'Invertir en comunidad conecta tu marca con talento tech activo en México.',
    },
  },
};

export const getContactFormConfig = (contactType) =>
  CONTACT_FORMS[contactType] ?? null;
