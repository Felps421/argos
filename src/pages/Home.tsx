import Hero from '../sections/Hero';
import CinematicText from '../sections/CinematicText';
import Metrics from '../sections/Metrics';
import Technology from '../sections/Technology';
import Architecture from '../sections/Architecture';
import Footer from '../sections/Footer';

interface HomeProps {
  entranceComplete: boolean;
}

export default function Home({ entranceComplete }: HomeProps) {
  return (
    <>
      <Hero entranceComplete={entranceComplete} />
      <CinematicText />
      <Metrics />
      <Technology />
      <Architecture />
      <Footer />
    </>
  );
}
