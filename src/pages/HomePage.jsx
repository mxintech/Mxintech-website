import Reveal from '../components/Reveal';
import HeroSection from '../sections/HeroSection';
import AcercadeSection from '../sections/AcercadeSection';
import WebinarsSection from '../sections/WebinarsSection';
import EventosSection from '../sections/EventosSection';

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
  </>
);

export default HomePage;
