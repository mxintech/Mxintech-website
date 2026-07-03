import Reveal from '../components/Reveal';
import HeroSection from '../sections/HeroSection';
import AcercadeSection from '../sections/AcercadeSection';
import WebinarsSection from '../sections/WebinarsSection';
import EventosSection from '../sections/EventosSection';
import UniversidadesSection from '../sections/UniversidadesSection';

const HomePage = () => (
  <>
    <Reveal>
      <HeroSection />
    </Reveal>
    <Reveal>
      <AcercadeSection />
    </Reveal>
    <Reveal>
      <WebinarsSection />
    </Reveal>
    <Reveal>
      <EventosSection />
    </Reveal>
    <Reveal>
      <UniversidadesSection />
    </Reveal>
  </>
);

export default HomePage;
