import { Link } from 'react-router-dom';
import {
  FaUserTie,
  FaCloud,
  FaBriefcase,
  FaChalkboardTeacher,
} from 'react-icons/fa';

const UNI_BENEFITS = [
  {
    Icon: FaUserTie,
    title: 'Forma líderes',
    text: 'Estudiantes que organizan talleres, comunican y lideran su club desarrollan habilidades que ninguna materia enseña.',
  },
  {
    Icon: FaCloud,
    title: 'Skills que pide la industria',
    text: 'Talleres prácticos de cloud, IA, DevOps y más, con las herramientas que las empresas usan hoy.',
  },
  {
    Icon: FaBriefcase,
    title: 'Confianza al egresar',
    text: 'Portafolio, red de contactos y experiencia real para llegar con seguridad a la primera entrevista de trabajo.',
  },
  {
    Icon: FaChalkboardTeacher,
    title: 'Apoyo para docentes',
    text: 'Contenido actualizado de la industria para complementar sus clases y vincular a sus grupos con profesionales.',
  },
];

const UniversidadesPage = () => (
  <section className="section universidades-section">
    <h2>Universidades</h2>
    <div className="universidades-layout">
      <img
        src="/img/universidades.jpg"
        alt="Estudiantes universitarios en un salón de clases"
        className="universidades-photo"
        loading="lazy"
      />
      <div className="universidades-copy">
        <p>
          Las comunidades tech son el puente entre la universidad y la industria. En
          ciudades como Guadalajara, Monterrey o CDMX, los user groups y meetups llevan
          años conectando a estudiantes con profesionales en activo: ahí aparecen los
          mentores, los primeros proyectos reales y, muchas veces, el primer empleo.
        </p>
        <p>
          En Tlaxcala ese ecosistema apenas está naciendo — y por eso cada colaboración
          tiene un impacto enorme. Como AWS User Group del estado, trabajamos con
          universidades para que estudiantes y docentes accedan a la nube, la IA y las
          prácticas reales de la industria sin salir de su campus.
        </p>
      </div>
    </div>
    <ul className="universidades-benefits">
      {UNI_BENEFITS.map(({ Icon, title, text }) => (
        <li key={title} className="uni-benefit">
          <span className="uni-benefit-icon" aria-hidden="true">
            <Icon />
          </span>
          <span className="uni-benefit-body">
            <strong>{title}</strong>
            <span>{text}</span>
          </span>
        </li>
      ))}
    </ul>
    <div className="section-cta">
      <p className="section-cta-text">¿Estudias o das clases en una universidad?</p>
      <div className="hero-actions universidades-cta-actions">
        <Link to="/contact/member" className="hero-button hero-primary">
          Únete a la comunidad
        </Link>
        <Link to="/contact/business" className="hero-button hero-secondary">
          Propón una colaboración
        </Link>
      </div>
    </div>
  </section>
);

export default UniversidadesPage;
