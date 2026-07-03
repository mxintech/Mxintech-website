import { FaExclamationCircle } from 'react-icons/fa';
import { KCD_2026 } from '../../config/content';

const AnnouncementBar = ({ hiddenOnMobile }) => {
  if (!KCD_2026.showAnnouncementBar) return null;

  return (
    <div
      className={`announcement-bar ${hiddenOnMobile ? 'announcement-bar--hidden-mobile' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="announcement-content">
        <FaExclamationCircle className="announcement-icon" aria-hidden />
        <span className="announcement-text">
          Anuncio importante: Kubernetes Community Day cambió de fecha de{' '}
          <s>{KCD_2026.oldDate}</s> a <strong>{KCD_2026.newDate}</strong>.{' '}
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
  );
};

export default AnnouncementBar;
