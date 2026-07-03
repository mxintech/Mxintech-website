import { Link } from 'react-router-dom';
import { FaTools, FaBell } from 'react-icons/fa';
import Reveal from '../components/Reveal';

const COURSES = [
  { title: 'Servidores Linux', text: 'Administra un servidor Linux.' },
  { title: 'Linux: Command Line', text: 'Aprende a usar comandos útiles en la terminal.' },
  { title: 'AWS IAM', text: 'Roles, Políticas, Usuarios y Grupos.' },
  { title: 'AWS S3', text: 'Almacenamiento, políticas S3 y ciclo de vida.' },
  { title: 'AWS RDS', text: 'Bases de datos MySQL y PostgreSQL.' },
];

const CursosPage = () => (
  <section id="info" className="section info-section">
    <h2>Cursos Disponibles</h2>
    <div className="info-cards">
      {COURSES.map(({ title, text }, index) => (
        <Reveal key={title} className="info-card" delay={index * 60}>
          <h3>{title}</h3>
          <p>{text}</p>
          <p className="wip-label">
            <FaTools aria-hidden />
            <span>Disponibles muy pronto</span>
          </p>
        </Reveal>
      ))}
    </div>
    <div className="section-cta">
      <p className="section-cta-text">¿Quieres que te avisemos cuando estén listos?</p>
      <Link to="/contact/member" className="hero-button hero-primary">
        <FaBell aria-hidden style={{ marginRight: '0.5rem' }} />
        Avísame de los cursos
      </Link>
    </div>
  </section>
);

export default CursosPage;
