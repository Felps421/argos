import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Lenis from 'lenis';
import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';
import ParticleTransition from './components/ParticleTransition';
import IntroVideo from './components/IntroVideo';
import Home from './pages/Home';
import Scan from './pages/Scan';
import Planos from './pages/Planos';
import { lenisRef } from './lib/lenis';

const INTRO_SEEN_KEY = 'argos-intro-seen';

function hasSeenIntro() {
  try {
    return sessionStorage.getItem(INTRO_SEEN_KEY) === '1';
  } catch {
    return false; // contexto sem sessionStorage (ex.: aba anônima restrita) — mostra o vídeo mesmo assim
  }
}

export default function App() {
  const [introDone, setIntroDone] = useState(hasSeenIntro);
  const [entranceComplete, setEntranceComplete] = useState(false);

  // O Hero só começa a entrar depois que o vídeo de abertura sai do caminho — senão a animação
  // dele tocaria escondida atrás do vídeo.
  useEffect(() => {
    if (!introDone) return;
    const timeout = setTimeout(() => setEntranceComplete(true), 400);
    return () => clearTimeout(timeout);
  }, [introDone]);

  useEffect(() => {
    const lenis = new Lenis();
    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const handleIntroDone = () => {
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {
      /* sem sessionStorage — sem problema, só toca de novo na próxima vez */
    }
    setIntroDone(true);
  };

  return (
    <div style={{ fontFamily: '"Space Mono", monospace' }}>
      <Navbar entranceComplete={entranceComplete} />
      <Routes>
        <Route path="/" element={<Home entranceComplete={entranceComplete} />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/planos" element={<Planos />} />
      </Routes>
      <PageTransition />
      <ParticleTransition />
      {!introDone && <IntroVideo src="/assents/video/llama-anteshero.mp4" onDone={handleIntroDone} />}
    </div>
  );
}
