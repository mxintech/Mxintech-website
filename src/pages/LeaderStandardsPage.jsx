import { Link } from 'react-router-dom';
import {
  FaHandHoldingHeart,
  FaUsers,
  FaBullhorn,
  FaBalanceScale,
  FaUserTie,
  FaHeart,
  FaGift,
  FaClipboardCheck,
} from 'react-icons/fa';
import Reveal from '../components/Reveal';

const RESPONSIBILITIES = [
  'Ser amable — la amabilidad va primero, siempre.',
  'Involucrar y empoderar a la comunidad para que participe y crezca.',
  'Mejorar la experiencia de quienes ya son miembros.',
  'Atraer a nuevos miembros y darles una bienvenida que los haga quedarse.',
  'Promover tecnologías con blogs, tutoriales, videos, charlas y más dentro de la comunidad.',
];

const BENEFITS = [
  'Reconocimiento por tu experiencia y tus contribuciones a la comunidad.',
  'Conoce a otros líderes y profesionales con la misma energía y valores de crecimiento.',
  'Apoyo y formación de México in Tech para eventos, charlas, creación de contenido o mentoría.',
  'Códigos de descuento para certificaciones AWS y boletos con descuento para eventos tech.',
  'Swag exclusivo y giveaways.',
];

const EVALUATION_CRITERIA = [
  'Un mínimo de 3 contribuciones al mes en el canal de Telegram.',
  'Haber sido miembro de la comunidad durante al menos 3 meses.',
  'Haber participado como speaker en público, de forma virtual o presencial.',
  'Haber creado contenido como blogs, videos u otros recursos sobre cualquier tecnología de TI.',
];

const STANDARDS = [
  {
    Icon: FaHandHoldingHeart,
    title: 'Respeto e inclusión',
    items: [
      'Trato respetuoso hacia cada persona de la comunidad, sin excepción.',
      'Cero tolerancia al acoso, la discriminación o el lenguaje despectivo.',
      'Fomentar espacios donde cualquier persona pueda participar y preguntar sin miedo.',
    ],
  },
  {
    Icon: FaUsers,
    title: 'Compromiso con la comunidad',
    items: [
      'Participar activamente: organizar, apoyar o difundir al menos una actividad por trimestre.',
      'Responder con oportunidad los acuerdos que tomes con el equipo organizador.',
      'Avisar con anticipación si necesitas pausar tu participación — la vida pasa, comunicarlo es lo profesional.',
    ],
  },
  {
    Icon: FaBullhorn,
    title: 'Representación',
    items: [
      'Al hablar en nombre de México in Tech | AWS UG Tlaxcala, hacerlo con honestidad y sin fines personales de lucro.',
      'Usar el nombre y la marca de la comunidad solo en actividades acordadas con el equipo.',
      'Dar crédito al trabajo de otras personas de la comunidad.',
    ],
  },
  {
    Icon: FaBalanceScale,
    title: 'Vigencia del rol',
    items: [
      'El rol de líder se revisa cada 6 meses junto con el equipo organizador.',
      'La inactividad prolongada sin aviso o el incumplimiento de estos estándares puede terminar el rol.',
      'Dejar de ser líder no te saca de la comunidad: siempre puedes volver a aplicar.',
    ],
  },
];

const LeaderStandardsPage = () => (
  <section className="section standards-section">
    <Reveal>
      <div className="standards-header">
        <h2>Estándares de Líderes</h2>
        <p className="standards-intro">
          Ser líder de México in Tech es un rol de confianza: representas a la comunidad
          ante estudiantes, profesionales y empresas. Estos estándares definen lo que la
          comunidad espera de ti — y lo que tú puedes esperar del equipo organizador.
        </p>
      </div>
    </Reveal>
    <div className="standards-grid">
      <Reveal className="standards-card standards-card--featured">
        <span className="standards-card-icon" aria-hidden="true">
          <FaHeart />
        </span>
        <h3>Responsabilidades del rol</h3>
        <ul>
          {RESPONSIBILITIES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Reveal>
      <Reveal className="standards-card standards-card--benefits" delay={60}>
        <span className="standards-card-icon" aria-hidden="true">
          <FaGift />
        </span>
        <h3>Beneficios del rol</h3>
        <ul>
          {BENEFITS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Reveal>
      {STANDARDS.map(({ Icon, title, items }, index) => (
        <Reveal key={title} className="standards-card" delay={index * 70}>
          <span className="standards-card-icon" aria-hidden="true">
            <Icon />
          </span>
          <h3>{title}</h3>
          <ul>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Reveal>
      ))}
      <Reveal className="standards-card standards-card--evaluation">
        <span className="standards-card-icon" aria-hidden="true">
          <FaClipboardCheck />
        </span>
        <h3>Criterios de evaluación</h3>
        <p className="standards-card-note">
          Al revisar tu aplicación, el equipo organizador toma en cuenta:
        </p>
        <ul>
          {EVALUATION_CRITERIA.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Reveal>
    </div>
    <div className="section-cta">
      <p className="section-cta-text">¿Cumples los requisitos y aceptas los estándares?</p>
      <Link to="/contact/leader" className="hero-button hero-primary">
        <FaUserTie aria-hidden style={{ marginRight: '0.5rem' }} />
        Aplica para ser líder
      </Link>
    </div>
  </section>
);

export default LeaderStandardsPage;
