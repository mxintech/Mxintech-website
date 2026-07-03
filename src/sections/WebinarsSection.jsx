import { FaYoutube } from 'react-icons/fa';
import { SOCIAL_LINKS, youtubeLiveUrl, youtubeThumbnail } from '../config/social';
import { WEBINARS } from '../config/content';

const WebinarsSection = () => (
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
              loading="lazy"
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
);

export default WebinarsSection;
