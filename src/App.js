import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Slider from './Slider';
import ContactPageLayout from './components/ContactPageLayout';
import video from './assets/aws-community-day-compat.mp4';
import ajolote from './assets/ajolote.png';
import logoAwsUgTlaxcala from './assets/logo-aws-ug-tlaxcala.svg';
import mascota from './assets/mascota.png';
import eventosImage from './assets/KCD2026.png';
import {
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaYoutube,
  FaTiktok,
  FaTwitch,
  FaBook,
  FaMapPin,
  FaUserPlus,
  FaUserTie,
  FaMicrophone,
  FaHandshake,
  FaCalendarAlt,
  FaExclamationCircle,
  FaHome,
  FaInfoCircle,
  FaVideo,
  FaTools,
  FaChevronLeft,
  FaChevronRight,
  FaCircle,
  FaRegCircle,
  FaMoon,
  FaSun,
  FaEnvelope
} from 'react-icons/fa';
import { SiMeetup } from 'react-icons/si';
import { SOCIAL_LINKS, youtubeLiveUrl, youtubeThumbnail } from './config/social';
import { WEBINARS, KCD_2026, AWS_COMMUNITY_DAY, MEETUP_LINK } from './config/content';
import { usePageMeta } from './hooks/usePageMeta';

const ACERCADE_SLIDES = [
  {
    title: 'Acerca de México in Tech | AWS User Group Tlaxcala',
    id: 'p-acercade',
    body: [
      'México in Tech es una comunidad dedicada a fomentar el aprendizaje y la colaboración en el ámbito tecnológico.\nSomos oficialmente un ',
      { type: 'strong', text: 'AWS User Group' },
      '.\nOfrecemos cursos, webinars y eventos para ayudar a los profesionales a crecer en sus carreras.'
    ]
  },
  {
    title: 'Misión',
    id: 'p-mision',
    body: 'Nuestra misión es empoderar a los desarrolladores mexicanos con conocimientos prácticos y reales, compartidos por expertos de la industria.\nQueremos crear un espacio donde los devs puedan aprender, colaborar y crecer juntos.'
  },
  {
    title: 'Visión',
    id: 'p-vision',
    body: 'Ser la comunidad de referencia en México para el aprendizaje y la colaboración tecnológica, impulsando el crecimiento profesional de los desarrolladores y contribuyendo al desarrollo del ecosistema tech en el país.'
  }
];

const renderSlideBody = (body) => {
  if (Array.isArray(body)) {
    return body.map((item, i) => {
      if (typeof item === 'string') return <span key={i}>{item}</span>;
      if (item && item.type === 'strong') return <strong key={i}>{item.text}</strong>;
      return item;
    });
  }
  return body;
};

const AcercadeSection = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const touchStartRef = useRef(null);

  const goTo = (index) => {
    setSlideIndex(Math.max(0, Math.min(index, ACERCADE_SLIDES.length - 1)));
  };

  const goPrev = () => {
    if (slideIndex === 0) goTo(ACERCADE_SLIDES.length - 1);
    else goTo(slideIndex - 1);
  };

  const goNext = () => {
    if (slideIndex === ACERCADE_SLIDES.length - 1) goTo(0);
    else goTo(slideIndex + 1);
  };

  const handleTouchStart = (e) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const start = touchStartRef.current;
    if (start == null) return;
    touchStartRef.current = null;
    const dx = e.changedTouches[0].clientX - start;
    const threshold = 50;
    if (dx > threshold) goPrev();
    else if (dx < -threshold) goNext();
  };

  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <section id="acercade" className="section acercade-section">
      <div className="acercade-pet-row">
        <div className="acercade-pet-container">
          <img src={mascota} alt="Mascota de México in Tech" className="acercade-mascota" />
        </div>
      </div>
      <div className="acercade-slider-row">
        <div className="acercade-slider-wrapper">
          <div
            className="acercade-slider-viewport acercade-slider-cols"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => { touchStartRef.current = null; }}
            role="region"
            aria-label="Contenido Acerca de - desliza para cambiar"
          >
            {/* Left 10%: peek of previous (wrap: when index 0, previous = last) */}
            <div
              className="acercade-col acercade-col-prev"
              role="button"
              tabIndex={0}
              onClick={goPrev}
              onKeyDown={(e) => handleKeyDown(e, goPrev)}
              aria-label="Ir a la sección anterior"
            >
              <div className="acercade-slide-box-wrap">
                <div className="acercade-slide-box">
                  <h4>{ACERCADE_SLIDES[(slideIndex - 1 + ACERCADE_SLIDES.length) % ACERCADE_SLIDES.length].title}</h4>
                  <p id={`${ACERCADE_SLIDES[(slideIndex - 1 + ACERCADE_SLIDES.length) % ACERCADE_SLIDES.length].id}-prev`}>
                    {renderSlideBody(ACERCADE_SLIDES[(slideIndex - 1 + ACERCADE_SLIDES.length) % ACERCADE_SLIDES.length].body)}
                  </p>
                </div>
              </div>
            </div>
            {/* Center 80%: current slide */}
            <div className="acercade-col acercade-col-center">
              <div key={slideIndex} className="acercade-slide-box">
                <h4>{ACERCADE_SLIDES[slideIndex].title}</h4>
                <p id={ACERCADE_SLIDES[slideIndex].id}>{renderSlideBody(ACERCADE_SLIDES[slideIndex].body)}</p>
              </div>
            </div>
            {/* Right 10%: peek of next (wrap: when index last, next = first) */}
            <div
              className="acercade-col acercade-col-next"
              role="button"
              tabIndex={0}
              onClick={goNext}
              onKeyDown={(e) => handleKeyDown(e, goNext)}
              aria-label="Ir a la sección siguiente"
            >
              <div className="acercade-slide-box-wrap">
                <div className="acercade-slide-box">
                  <h4>{ACERCADE_SLIDES[(slideIndex + 1) % ACERCADE_SLIDES.length].title}</h4>
                  <p id={`${ACERCADE_SLIDES[(slideIndex + 1) % ACERCADE_SLIDES.length].id}-next`}>
                    {renderSlideBody(ACERCADE_SLIDES[(slideIndex + 1) % ACERCADE_SLIDES.length].body)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="acercade-slider-footer">
          <div className="acercade-slider-nav">
            <button
              type="button"
              className="acercade-slider-arrow acercade-slider-prev"
              onClick={goPrev}
              aria-label="Anterior"
            >
              <FaChevronLeft />
            </button>
            <div className="acercade-slider-dots" role="tablist" aria-label="Sección del contenido">
              {ACERCADE_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === slideIndex}
                  aria-label={`Ir a sección ${i + 1}`}
                  className={`acercade-dot ${i === slideIndex ? 'acercade-dot--active' : ''}`}
                  onClick={() => goTo(i)}
                >
                  {i === slideIndex ? <FaCircle /> : <FaRegCircle />}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="acercade-slider-arrow acercade-slider-next"
              onClick={goNext}
              aria-label="Siguiente"
            >
              <FaChevronRight />
            </button>
          </div>
          <p className="acercade-swipe-hint">Desliza o usa las flechas para ver más</p>
        </div>
      </div>
    </section>
  );
};

const HomePage = () => {
  const eventosVideoRef = useRef(null);

  return (
    <>
      {/* Slider de Bienvenida */}
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
              <b>DE DEVS PARA DEVS:</b> Comunidades tech en México. Somos el AWS User Group Tlaxcala — webinars, eventos y cursos para impulsar tu carrera.
            </p>
            <div className="hero-actions">
              <Link to="/contact/member" className="hero-button hero-primary">
                Únete a la comunidad
              </Link>
              <a href="/#eventos" className="hero-button hero-secondary">
                Ver los próximos eventos
              </a>
            </div>
          </div>
        </div>
      </section>

      <AcercadeSection />

      {/* Webinars */}
      <section id="video" className="section webinars-section">
        <h2>Webinars</h2>
        <div className="webinars-grid">
          {WEBINARS.map((webinar) => (
            <a
              key={webinar.id}
              href={youtubeLiveUrl(webinar.id)}
              target="_blank"
              rel="noopener noreferrer"
              className="webinar-card"
            >
              <div className="webinar-thumbnail">
                <img
                  src={youtubeThumbnail(webinar.id)}
                  alt={webinar.title}
                  onError={(e) => {
                    e.target.src = youtubeThumbnail(webinar.id, 'hqdefault');
                  }}
                />
                <div className="webinar-play-overlay">
                  <FaYoutube className="play-icon" />
                </div>
              </div>
              <h3 className="webinar-title">{webinar.title}</h3>
            </a>
          ))}
        </div>
        <div className="webinars-subscribe">
          <a
            href={SOCIAL_LINKS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="subscribe-button"
          >
            <FaYoutube className="subscribe-icon" />
            <span>Suscríbete al canal</span>
          </a>
        </div>
      </section>

      {/* Eventos */}
      <section id="eventos" className="section eventos-section">
        <h2>Eventos</h2>
        <div className="eventos-grid">
          <div className="eventos-video-col">
            <div className="eventos-video-wrap">
              <div className="eventos-video-content">
                <h3 className="eventos-card-title">{AWS_COMMUNITY_DAY.name}</h3>
                <p className="eventos-date">
                  <FaCalendarAlt aria-hidden />
                  {AWS_COMMUNITY_DAY.date}
                </p>
              </div>
              <video
                ref={eventosVideoRef}
                controls
                playsInline
                onLoadedMetadata={(e) => { e.target.volume = 0.6; }}
              >
                <source src={video} type="video/mp4" />
                Tu navegador no soporta el video.
              </video>
            </div>
          </div>
        <div className="eventos-card eventos-card-1">
          <h3 className="eventos-card-title">Próximos eventos</h3>
          <div className="eventos-card-content">
            <p>{KCD_2026.name}</p>
            <p className="eventos-date">
              <FaCalendarAlt aria-hidden />
              <s>{KCD_2026.oldDate}</s>
            </p>
            <p className="eventos-date eventos-date-update">
              <FaExclamationCircle aria-hidden />
              <strong>Fecha actualizada: {KCD_2026.newDate}</strong>
            </p>
            <img src={eventosImage} alt={KCD_2026.name} />
          </div>
        </div>
        <div className="eventos-card eventos-card-2">
          <h3 className="eventos-card-title">Comunidad</h3>
          <div className="eventos-card-content">
            <p>Únete al grupo de AWS, participa en eventos presenciales y en línea, y conecta con más desarrolladores.</p>
            <a
              href={MEETUP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="eventos-meetup-link"
            >
              <SiMeetup className="eventos-meetup-icon" aria-hidden />
              <span>Unirse en Meetup</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  </>
  );
};

const MemberContactPage = () => <ContactPageLayout contactType="member" />;
const LeaderContactPage = () => <ContactPageLayout contactType="leader" />;
const SpeakerContactPage = () => <ContactPageLayout contactType="speaker" />;
const BusinessContactPage = () => <ContactPageLayout contactType="business" />;

const CursosPage = () => (
  <section id="info" className="section info-section">
    <h2>Cursos Disponibles</h2>
      <div className="info-cards">
        <div className="info-card">
          <h3>Servidores Linux</h3>
          <p>Administra un servidor Linux.</p>
          <p className="wip-label"><FaTools aria-hidden /><span>Disponibles muy pronto</span></p>
        </div>
        <div className="info-card">
          <h3>Linux: Command Line</h3>
          <p>Aprende a usar comandos útiles en la terminal.</p>
          <p className="wip-label"><FaTools aria-hidden /><span>Disponibles muy pronto</span></p>
        </div>
        <div className="info-card">
          <h3>AWS IAM</h3>
          <p>Roles, Políticas, Usuarios y Grupos.</p>
          <p className="wip-label"><FaTools aria-hidden /><span>Disponibles muy pronto</span></p>
        </div>
        <div className="info-card">
          <h3>AWS S3</h3>
          <p>Almacenamiento, políticas S3 y ciclo de vida.</p>
          <p className="wip-label"><FaTools aria-hidden /><span>Disponibles muy pronto</span></p>
        </div>
        <div className="info-card">
          <h3>AWS RDS</h3>
          <p>Bases de datos MySQL y PostgreSQL.</p>
          <p className="wip-label"><FaTools aria-hidden /><span>Disponibles muy pronto</span></p>
        </div>
      </div>
  </section>
);

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [hideAnnouncementMobile, setHideAnnouncementMobile] = useState(false);
  const location = useLocation();
  usePageMeta();

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const savedTheme = localStorage.getItem('theme');
    const initialTheme = savedTheme === 'dark' || savedTheme === 'light'
      ? savedTheme
      : (prefersDark.matches ? 'dark' : 'light');
    setTheme(initialTheme);

    const handleChange = (event) => {
      if (localStorage.getItem('theme')) return;
      setTheme(event.matches ? 'dark' : 'light');
    };

    prefersDark.addEventListener('change', handleChange);
    return () => prefersDark.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  /* Scroll to hash when navigating to home sections (wait for route render) */
  useEffect(() => {
    if (location.pathname !== '/' || !location.hash) return;
    const id = location.hash.slice(1);
    const scrollToHash = () => {
      const el = id ? document.getElementById(id) : null;
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    requestAnimationFrame(() => requestAnimationFrame(scrollToHash));
  }, [location.pathname, location.hash]);

  /* Scroll to top when changing non-hash routes (e.g. /cursos, /contact/*) */
  useEffect(() => {
    if (location.hash) return;
    window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!KCD_2026.showAnnouncementBar) return;

    const handleAnnouncementVisibility = () => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      if (!isMobile) {
        setHideAnnouncementMobile(false);
        return;
      }
      setHideAnnouncementMobile(window.scrollY > 24);
    };

    handleAnnouncementVisibility();
    window.addEventListener('scroll', handleAnnouncementVisibility, { passive: true });
    window.addEventListener('resize', handleAnnouncementVisibility);

    return () => {
      window.removeEventListener('scroll', handleAnnouncementVisibility);
      window.removeEventListener('resize', handleAnnouncementVisibility);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div
      className={`App ${hideAnnouncementMobile ? 'announcement-collapsed-mobile' : ''} ${
        !KCD_2026.showAnnouncementBar ? 'announcement-disabled' : ''
      }`}
    >
      {/* Barra de navegación */}
      <header className="header">
        <nav className="nav">
          <div className="nav-col nav-col-left">
            <div className="nav-logo">
              <img src={ajolote} alt="Mexico in Tech" className="nav-logo-icon" />
              <img src={logoAwsUgTlaxcala} alt="AWS User Group Tlaxcala" className="nav-logo-icon nav-logo-icon-aws" />
              <span className="nav-logo-text nav-logo-text-long">Mexico in Tech | AWS User Group Tlaxcala</span>
              <span className="nav-logo-text nav-logo-text-short" aria-hidden="true">MXINTECH | AWS UG Tlx</span>
            </div>
          </div>

          <div className="nav-col nav-col-right">
            <div className="nav-actions">
              {/* Botón hamburguesa */}
              <button className="hamburger" onClick={toggleMenu}>
                ☰
              </button>

              {/* Enlaces del menú */}
              <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
                <li>
                  <a href="/#inicio" onClick={closeMenu} className="nav-link-item">
                    <FaHome className="nav-link-icon" aria-hidden />
                    <span>Inicio</span>
                  </a>
                </li>
                <li>
                  <a href="/#acercade" onClick={closeMenu} className="nav-link-item">
                    <FaInfoCircle className="nav-link-icon" aria-hidden />
                    <span>Acerca de</span>
                  </a>
                </li>
                <li>
                  <a href="/#video" onClick={closeMenu} className="nav-link-item">
                    <FaVideo className="nav-link-icon" aria-hidden />
                    <span>Webinars</span>
                  </a>
                </li>
                <li>
                  <a href="/#eventos" onClick={closeMenu} className="nav-link-item">
                    <FaCalendarAlt className="nav-link-icon" aria-hidden />
                    <span>Eventos</span>
                  </a>
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

      {KCD_2026.showAnnouncementBar && (
      <div
        className={`announcement-bar ${hideAnnouncementMobile ? 'announcement-bar--hidden-mobile' : ''}`}
        role="status"
        aria-live="polite"
      >
        <div className="announcement-content">
          <FaExclamationCircle className="announcement-icon" aria-hidden />
          <span className="announcement-text">
            Anuncio importante: Kubernetes Community Day cambió de fecha de <s>{KCD_2026.oldDate}</s> a <strong>{KCD_2026.newDate}</strong>.{" "}
            <a
              href={KCD_2026.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="announcement-link"
            >
              Sitio oficial
            </a>
          </span>
        </div>
      </div>
      )}


      <div className="theme-toggle-wrap">
        <input
          type="checkbox"
          className="theme-checkbox"
          id="theme-checkbox"
          checked={theme === 'dark'}
          onChange={toggleTheme}
          aria-label="Cambiar tema"
        />
        <label htmlFor="theme-checkbox" className="theme-checkbox-label">
          <FaMoon className="theme-icon theme-icon-moon" aria-hidden />
          <FaSun className="theme-icon theme-icon-sun" aria-hidden />
          <span className="theme-ball" />
        </label>
      </div>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cursos" element={<CursosPage />} />
          <Route path="/contact" element={<Navigate to="/contact/member" replace />} />
          <Route path="/contact/member" element={<MemberContactPage />} />
          <Route path="/contact/leader" element={<LeaderContactPage />} />
          <Route path="/contact/speaker" element={<SpeakerContactPage />} />
          <Route path="/contact/business" element={<BusinessContactPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-col footer-col-brand">
            <div className="footer-brand-header">
              <img src={ajolote} alt="Ajolote" className="footer-logo" />
              <h3>Mexico in Tech</h3>
            </div>
            <p>Compartiendo conocimiento real, webinars y eventos para impulsar tu carrera.</p>
            <p className="footer-location">
              <FaMapPin className="footer-location-icon" aria-hidden />
              <span>  Desde Tlaxcala, México.</span>
            </p>
          </div>
          <div className="footer-col footer-col-links">
            <h3>Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/cursos" className="footer-link">
                  <FaBook className="footer-link-icon" aria-hidden />
                  <span>Cursos</span>
                </Link>
              </li>
              <li>
                <Link to="/contact/member" className="footer-link">
                  <FaUserPlus className="footer-link-icon" aria-hidden />
                  <span>Conviértete en miembro</span>
                </Link>
              </li>
              <li>
                <Link to="/contact/leader" className="footer-link">
                  <FaUserTie className="footer-link-icon" aria-hidden />
                  <span>Sé un líder</span>
                </Link>
              </li>
              <li>
                <Link to="/contact/speaker" className="footer-link">
                  <FaMicrophone className="footer-link-icon" aria-hidden />
                  <span>Sé un speaker</span>
                </Link>
              </li>
              <li>
                <Link to="/contact/business" className="footer-link">
                  <FaHandshake className="footer-link-icon" aria-hidden />
                  <span>Patrocinio empresarial</span>
                </Link>
              </li>
            </ul>
          </div>
          <div className="footer-col footer-col-legal">
            <div className="footer-social">
              <h3 className="footer-social-label">Síguenos</h3>
              <div className="social-icons">
                <a
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <FaFacebook />
                </a>
                <a
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin />
                </a>
                <a
                  href={SOCIAL_LINKS.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                >
                  <FaYoutube />
                </a>
                <a
                  href={SOCIAL_LINKS.x}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                >
                  <FaTwitter />
                </a>
                <a
                  href={SOCIAL_LINKS.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                >
                  <FaTiktok />
                </a>
                <a
                  href={SOCIAL_LINKS.twitch}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitch"
                >
                  <FaTwitch />
                </a>
              </div>
              <div className="footer-meetup-row">
                <a
                  href={MEETUP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="eventos-meetup-link footer-meetup-link"
                >
                  <SiMeetup className="eventos-meetup-icon" aria-hidden />
                  <span>Unirse en Meetup</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2026 Mexico in Tech. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
