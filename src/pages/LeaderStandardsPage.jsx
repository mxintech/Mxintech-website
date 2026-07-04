import { Link } from 'react-router-dom';
import {
  FaHandHoldingHeart,
  FaUsers,
  FaBullhorn,
  FaBalanceScale,
  FaUserTie,
} from 'react-icons/fa';
import Reveal from '../components/Reveal';

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
