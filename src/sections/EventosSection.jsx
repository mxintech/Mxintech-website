import { FaCalendarAlt, FaExclamationCircle } from 'react-icons/fa';
import { SiMeetup } from 'react-icons/si';
import eventosImage from '../assets/KCD2026.png';
import { KCD_2026, AWS_COMMUNITY_DAY, MEETUP_LINK } from '../config/content';

/* Served from public/ so the 48MB video stays out of the JS build and only
   downloads metadata until the user presses play. */
const EVENT_VIDEO_URL = '/assets/aws-community-day.mp4';

const EventosSection = () => (
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
            controls
            playsInline
            preload="metadata"
            onLoadedMetadata={(e) => { e.target.volume = 0.6; }}
          >
            <source src={EVENT_VIDEO_URL} type="video/mp4" />
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
          <img src={eventosImage} alt={KCD_2026.name} loading="lazy" />
        </div>
      </div>
      <div className="eventos-card eventos-card-2">
        <h3 className="eventos-card-title">Comunidad</h3>
        <div className="eventos-card-content">
          <p>
            Únete al grupo de AWS, participa en eventos presenciales y en línea, y conecta
            con más desarrolladores.
          </p>
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
);

export default EventosSection;
