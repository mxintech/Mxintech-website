import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaHome,
  FaInfoCircle,
  FaVideo,
  FaCalendarAlt,
  FaGraduationCap,
  FaBook,
  FaEnvelope,
} from 'react-icons/fa';
import ajolote from '../../assets/ajolote.png';
import logoAwsUgTlaxcala from '../../assets/logo-aws-ug-tlaxcala.svg';

const NAV_SECTIONS = [
  { href: '/#inicio', label: 'Inicio', Icon: FaHome },
  { href: '/#acercade', label: 'Acerca de', Icon: FaInfoCircle },
  { href: '/#video', label: 'Webinars', Icon: FaVideo },
  { href: '/#eventos', label: 'Eventos', Icon: FaCalendarAlt },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((open) => !open);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      <nav className="nav">
        <div className="nav-col nav-col-left">
          <div className="nav-logo">
            <img src={ajolote} alt="Mexico in Tech" className="nav-logo-icon" />
            <img
              src={logoAwsUgTlaxcala}
              alt="AWS User Group Tlaxcala"
              className="nav-logo-icon nav-logo-icon-aws"
            />
            <span className="nav-logo-text nav-logo-text-long">
              Mexico in Tech | AWS User Group Tlaxcala
            </span>
            <span className="nav-logo-text nav-logo-text-short" aria-hidden="true">
              MXINTECH | AWS UG Tlx
            </span>
          </div>
        </div>

        <div className="nav-col nav-col-right">
          <div className="nav-actions">
            <button
              className="hamburger"
              onClick={toggleMenu}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
            >
              ☰
            </button>

            <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
              {NAV_SECTIONS.map(({ href, label, Icon }) => (
                <li key={href}>
                  <a href={href} onClick={closeMenu} className="nav-link-item">
                    <Icon className="nav-link-icon" aria-hidden />
                    <span>{label}</span>
                  </a>
                </li>
              ))}
              <li>
                <Link to="/universidades" onClick={closeMenu} className="nav-link-item">
                  <FaGraduationCap className="nav-link-icon" aria-hidden />
                  <span>Universidades</span>
                </Link>
              </li>
              <li>
                <Link to="/cursos" onClick={closeMenu} className="nav-link-item">
                  <FaBook className="nav-link-icon" aria-hidden />
                  <span>Cursos</span>
                </Link>
              </li>
              <li>
                <Link to="/contact/member" onClick={closeMenu} className="nav-link-item">
                  <FaEnvelope className="nav-link-icon" aria-hidden />
                  <span>Contacto</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
