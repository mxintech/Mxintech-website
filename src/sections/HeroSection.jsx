import { Link } from 'react-router-dom';
import { FaAws, FaVideo, FaUsers } from 'react-icons/fa';
import Slider from '../Slider';
import ajolote from '../assets/ajolote.png';
import { COMMUNITY_METRICS } from '../config/community';

/* Social proof: only verifiable facts derived from site content/config. */
const PROOF_BADGES = [
  { Icon: FaAws, text: 'AWS User Group oficial' },
  { Icon: FaVideo, text: `${COMMUNITY_METRICS.webinarsRecorded}+ webinars grabados` },
  { Icon: FaUsers, text: 'Eventos presenciales y en línea' },
];

const HeroSection = () => (
  <section id="inicio" className="section">
    <div className="hero-layout">
      <div className="hero-slider">
        <Slider />
      </div>
      <div className="hero-copy">
        <div className="hero-brand">
          <img src={ajolote} alt="Ajolote — logo de México in Tech" className="hero-logo" />
          <h1 className="hero-brand-name">Mexico in Tech</h1>
        </div>
        <p className="hero-description">
          <b>DE DEVS PARA DEVS:</b> Comunidades tech en México. Somos el AWS User Group
          Tlaxcala — webinars, eventos y cursos para impulsar tu carrera.
        </p>
        <div className="hero-actions">
          <Link to="/contact/member" className="hero-button hero-primary">
            Únete a la comunidad
          </Link>
          <a href="/#eventos" className="hero-button hero-secondary">
            Ver los próximos eventos
          </a>
        </div>
        <ul className="hero-proof" aria-label="Nuestra comunidad">
          {PROOF_BADGES.map(({ Icon, text }) => (
            <li key={text} className="hero-proof-item">
              <Icon aria-hidden />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

export default HeroSection;
