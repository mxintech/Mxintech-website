import { Link } from 'react-router-dom';
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
} from 'react-icons/fa';
import { SiMeetup } from 'react-icons/si';
import ajolote from '../../assets/ajolote.png';
import { SOCIAL_LINKS } from '../../config/social';
import { MEETUP_LINK } from '../../config/content';

const SOCIAL_ICONS = [
  { href: SOCIAL_LINKS.facebook, label: 'Facebook', Icon: FaFacebook },
  { href: SOCIAL_LINKS.linkedin, label: 'LinkedIn', Icon: FaLinkedin },
  { href: SOCIAL_LINKS.youtube, label: 'YouTube', Icon: FaYoutube },
  { href: SOCIAL_LINKS.x, label: 'X (Twitter)', Icon: FaTwitter },
  { href: SOCIAL_LINKS.tiktok, label: 'TikTok', Icon: FaTiktok },
  { href: SOCIAL_LINKS.twitch, label: 'Twitch', Icon: FaTwitch },
];

const FOOTER_LINKS = [
  { to: '/cursos', label: 'Cursos', Icon: FaBook },
  { to: '/contact/member', label: 'Conviértete en miembro', Icon: FaUserPlus },
  { to: '/contact/leader', label: 'Sé un líder', Icon: FaUserTie },
  { to: '/contact/speaker', label: 'Sé un speaker', Icon: FaMicrophone },
  { to: '/contact/business', label: 'Patrocinio empresarial', Icon: FaHandshake },
];

const Footer = () => (
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
          {FOOTER_LINKS.map(({ to, label, Icon }) => (
            <li key={to}>
              <Link to={to} className="footer-link">
                <Icon className="footer-link-icon" aria-hidden />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="footer-col footer-col-legal">
        <div className="footer-social">
          <h3 className="footer-social-label">Síguenos</h3>
          <div className="social-icons">
            {SOCIAL_ICONS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
              >
                <Icon />
              </a>
            ))}
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
      <p className="footer-copyright">© 2026 Mexico in Tech. Todos los derechos reservados.</p>
    </div>
  </footer>
);

export default Footer;
