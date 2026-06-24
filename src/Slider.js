import React, { useEffect, useState, useRef, useCallback } from "react";
import "./Slider.css";
import slide1 from "./assets/KCD2026.png";
import slide2 from "./assets/slide2.jpg";
import slide3 from "./assets/slide3.jpg";
import slide4 from "./assets/slide4.jpg";
import { FaStar, FaCalendarAlt, FaMapPin } from "react-icons/fa";
import { SiAmazonwebservices } from "react-icons/si";

const INTERVAL_MS = 20000;
const TICK_MS = 100;

const SLIDES = [
  {
    id: 1,
    url: slide1,
    caption: "Kubernetes Community Day 2026, Guadalajara",
    icons: [
      { Icon: FaCalendarAlt, key: "calendar", label: "Calendar" },
      { Icon: FaMapPin, key: "map-pin", label: "Map Pin" },
    ],
  },
  {
    id: 2,
    url: slide2,
    caption: "Oficialmente Somos un AWS User Group.",
    icons: [
      { Icon: FaStar, key: "tada", label: "Celebration" },
      { Icon: SiAmazonwebservices, key: "aws", label: "AWS" },
    ],
  },
  { id: 3, url: slide3, caption: "1er meetup presencial de la comunidad." },
  { id: 4, url: slide4, caption: "Webinar: Aprendimos sobre GitOps, ArgoCD, Rollouts y más." },
];

const SLIDE_COUNT = SLIDES.length;

const Slider = () => {
  const [current, setCurrent] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const touchStartRef = useRef(null);
  const slide = SLIDES[current];

  const goToSlide = useCallback((index) => {
    setCurrent(index);
    setElapsed(0);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDE_COUNT);
    setElapsed(0);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDE_COUNT) % SLIDE_COUNT);
    setElapsed(0);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + TICK_MS;
        if (next >= INTERVAL_MS) {
          setCurrent((c) => (c + 1) % SLIDE_COUNT);
          return 0;
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  const progressPercent = Math.min(100, (elapsed / INTERVAL_MS) * 100);

  const handleTouchStart = (e) => {
    touchStartRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const start = touchStartRef.current;
    if (start == null) return;
    touchStartRef.current = null;
    const dx = e.changedTouches[0].clientX - start;
    const threshold = 50;
    if (dx > threshold) prevSlide();
    else if (dx < -threshold) nextSlide();
  };

  return (
    <div className="slider-hero">
      <div
        className="slider-frame"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => { touchStartRef.current = null; }}
        role="region"
        aria-roledescription="carousel"
        aria-label="Slider de bienvenida"
      >
        <div className="slider-media" key={slide.id} aria-hidden="true">
          <img
            className="slider-media-backdrop"
            src={slide.url}
            alt=""
            decoding="async"
            draggable={false}
          />
          <img
            className="slider-media-foreground"
            src={slide.url}
            alt=""
            decoding="async"
            draggable={false}
          />
        </div>

        <div className="slider-overlay" />

        <div className="slider-welcome-message">
          {slide.icons && (
            <div className="slider-caption-icons" aria-hidden>
              {slide.icons.map(({ Icon, key, label }) => (
                <Icon key={key} className={`slider-icon slider-icon-${key}`} aria-label={label} />
              ))}
            </div>
          )}
          <p className="caption" id="slider-current-caption">{slide.caption}</p>
        </div>

        <div className="slider-toolbar">
          <button type="button" onClick={prevSlide} className="slider-button" aria-label="Slide anterior">
            ❮
          </button>

          <div className="slider-center-group">
            <div className="slider-progress-wrap" aria-hidden="true">
              <div className="slider-progress-bar" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="slider-dots" role="tablist" aria-label="Slides">
              {SLIDES.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === current}
                  aria-controls="slider-current-caption"
                  className={`slider-dot ${idx === current ? "active" : ""}`}
                  onClick={() => goToSlide(idx)}
                  aria-label={`Ir al slide ${idx + 1}: ${item.caption}`}
                />
              ))}
            </div>
          </div>

          <button type="button" onClick={nextSlide} className="slider-button" aria-label="Slide siguiente">
            ❯
          </button>
        </div>
      </div>
    </div>
  );
};

export default Slider;
