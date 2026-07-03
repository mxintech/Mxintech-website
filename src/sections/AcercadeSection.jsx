import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaChevronLeft,
  FaChevronRight,
  FaCircle,
  FaRegCircle,
} from 'react-icons/fa';
import mascota from '../assets/mascota.png';

export const ACERCADE_SLIDES = [
  {
    title: 'Acerca de México in Tech | AWS User Group Tlaxcala',
    id: 'p-acercade',
    body: [
      'México in Tech es una comunidad dedicada a fomentar el aprendizaje y la colaboración en el ámbito tecnológico.\nSomos oficialmente un ',
      { type: 'strong', text: 'AWS User Group' },
      '.\nOfrecemos cursos, webinars y eventos para ayudar a los profesionales a crecer en sus carreras.',
    ],
  },
  {
    title: 'Misión',
    id: 'p-mision',
    body: 'Nuestra misión es empoderar a los desarrolladores mexicanos con conocimientos prácticos y reales, compartidos por expertos de la industria.\nQueremos crear un espacio donde los devs puedan aprender, colaborar y crecer juntos.',
  },
  {
    title: 'Visión',
    id: 'p-vision',
    body: 'Ser la comunidad de referencia en México para el aprendizaje y la colaboración tecnológica, impulsando el crecimiento profesional de los desarrolladores y contribuyendo al desarrollo del ecosistema tech en el país.',
  },
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

  const prevSlide = ACERCADE_SLIDES[(slideIndex - 1 + ACERCADE_SLIDES.length) % ACERCADE_SLIDES.length];
  const nextSlide = ACERCADE_SLIDES[(slideIndex + 1) % ACERCADE_SLIDES.length];

  return (
    <section id="acercade" className="section acercade-section">
      <div className="acercade-pet-row">
        <div className="acercade-pet-container">
          <img
            src={mascota}
            alt="Mascota de México in Tech"
            className="acercade-mascota"
            loading="lazy"
          />
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
                  <h4>{prevSlide.title}</h4>
                  <p id={`${prevSlide.id}-prev`}>{renderSlideBody(prevSlide.body)}</p>
                </div>
              </div>
            </div>
            {/* Center 80%: current slide */}
            <div className="acercade-col acercade-col-center">
              <div key={slideIndex} className="acercade-slide-box">
                <h4>{ACERCADE_SLIDES[slideIndex].title}</h4>
                <p id={ACERCADE_SLIDES[slideIndex].id}>
                  {renderSlideBody(ACERCADE_SLIDES[slideIndex].body)}
                </p>
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
                  <h4>{nextSlide.title}</h4>
                  <p id={`${nextSlide.id}-next`}>{renderSlideBody(nextSlide.body)}</p>
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
      <div className="section-cta">
        <p className="section-cta-text">¿Te identificas con nuestra misión?</p>
        <Link to="/contact/member" className="hero-button hero-primary">
          Únete a la comunidad
        </Link>
      </div>
    </section>
  );
};

export default AcercadeSection;
