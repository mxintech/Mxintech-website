import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/layout/Header';
import AnnouncementBar from './components/layout/AnnouncementBar';
import ThemeToggle from './components/layout/ThemeToggle';
import Footer from './components/layout/Footer';
import ContactPageLayout from './components/ContactPageLayout';
import HomePage from './pages/HomePage';
import CursosPage from './pages/CursosPage';
import LeaderStandardsPage from './pages/LeaderStandardsPage';
import NotFoundPage from './pages/NotFoundPage';
import { useTheme } from './hooks/useTheme';
import { usePageMeta } from './hooks/usePageMeta';
import { KCD_2026 } from './config/content';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [hideAnnouncementMobile, setHideAnnouncementMobile] = useState(false);
  const location = useLocation();
  usePageMeta();

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

  /* Collapse the announcement bar on mobile after scrolling */
  useEffect(() => {
    if (!KCD_2026.showAnnouncementBar) return undefined;

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

  return (
    <div
      className={`App ${hideAnnouncementMobile ? 'announcement-collapsed-mobile' : ''} ${
        !KCD_2026.showAnnouncementBar ? 'announcement-disabled' : ''
      }`}
    >
      <Header />
      <AnnouncementBar hiddenOnMobile={hideAnnouncementMobile} />
      <ThemeToggle theme={theme} onToggle={toggleTheme} />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cursos" element={<CursosPage />} />
          <Route path="/lideres/estandares" element={<LeaderStandardsPage />} />
          <Route path="/contact" element={<Navigate to="/contact/member" replace />} />
          <Route path="/contact/member" element={<ContactPageLayout contactType="member" />} />
          <Route path="/contact/leader" element={<ContactPageLayout contactType="leader" />} />
          <Route path="/contact/speaker" element={<ContactPageLayout contactType="speaker" />} />
          <Route path="/contact/business" element={<ContactPageLayout contactType="business" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
