import { Link } from 'react-router-dom';
import { FaHome, FaEnvelope } from 'react-icons/fa';
import mascota from '../assets/mascota.png';

const NotFoundPage = () => (
  <section className="section not-found-section">
    <div className="not-found-content">
      <img src={mascota} alt="" className="not-found-mascota" aria-hidden />
      <h2 className="not-found-code">404</h2>
      <p className="not-found-title">Página no encontrada</p>
      <p className="not-found-text">
        La página que buscas no existe o cambió de lugar. Nuestro ajolote ya está
        investigando.
      </p>
      <div className="hero-actions not-found-actions">
        <Link to="/" className="hero-button hero-primary">
          <FaHome aria-hidden style={{ marginRight: '0.5rem' }} />
          Volver al inicio
        </Link>
        <Link to="/contact/member" className="hero-button hero-secondary">
          <FaEnvelope aria-hidden style={{ marginRight: '0.5rem' }} />
          Contáctanos
        </Link>
      </div>
    </div>
  </section>
);

export default NotFoundPage;
