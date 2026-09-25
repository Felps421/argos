import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ScrambleIn from '../components/ScrambleIn';
import ScanForm from '../components/ScanForm';
import { VIDEOS } from '../constants';

interface HeroProps {
  entranceComplete: boolean;
}

export default function Hero({ entranceComplete }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTimeRef = useRef(0);
  const isSeekingRef = useRef(false);
  const lastXRef = useRef<number | null>(null);

  // Vídeo controlado pelo mouse: o movimento horizontal na tela "arrasta" a linha do tempo.
  // Por delta (não posição absoluta) e encadeado pelo evento `seeked`, pra nunca pedir um
  // segundo seek antes do vídeo terminar de responder ao primeiro (o que derruba quadros).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const applySeek = () => {
      if (isSeekingRef.current) return;
      if (!Number.isFinite(video.duration)) return;
      const clamped = Math.max(0, Math.min(video.duration, targetTimeRef.current));
      if (Math.abs(video.currentTime - clamped) < 0.01) return;
      isSeekingRef.current = true;
      video.currentTime = clamped;
    };

    const onSeeked = () => {
      isSeekingRef.current = false;
      applySeek(); // se o alvo mudou enquanto buscava, já encadeia o próximo seek
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!Number.isFinite(video.duration)) return;
      if (lastXRef.current === null) {
        lastXRef.current = e.clientX;
        return;
      }
      const deltaX = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
      const deltaTime = (deltaX / window.innerWidth) * video.duration * 0.8; // fator de sensibilidade
      targetTimeRef.current = Math.max(0, Math.min(video.duration, targetTimeRef.current + deltaTime));
      applySeek();
    };

    video.addEventListener('seeked', onSeeked);
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      video.removeEventListener('seeked', onSeeked);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <section className="relative h-screen h-[100dvh] w-full overflow-hidden">
      <video
        ref={videoRef}
        src={VIDEOS.hero}
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* sombra por baixo, só onde o texto fica — sem isso, em telas estreitas o vídeo corta mais
          fechado (retrato) e às vezes o pelo claro da lhama cai bem atrás do título, quase
          apagando ele; esse degradê garante contraste em qualquer enquadramento do vídeo. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 via-40% to-transparent" />

      {/* grade de pontos, quase invisível */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      {/* marca d'água "ARGOS" atrás do conteúdo */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 select-none whitespace-nowrap text-[clamp(120px,30vw,521px)] uppercase opacity-10"
        style={{
          transform: 'translate(-50%, calc(-50% + 50px))',
          fontFamily: '"Anton SC", sans-serif',
          letterSpacing: '-4px',
          backgroundImage: 'radial-gradient(circle, rgba(142,127,148,0) 0%, #8E7F94 70%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        ARGOS
      </div>

      <div className="relative z-10 flex h-full flex-col px-4 pb-[10vh] pt-20 sm:px-6 sm:pb-[14vh] sm:pt-24 md:px-8">
        <div className="flex-1" />

        <motion.div
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: entranceComplete ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          <div className="flex flex-col gap-5">
            <h1 className="text-[clamp(40px,10vw,100px)] font-light leading-[0.95] tracking-[-0.03em] text-white">
              <ScrambleIn text="Todo Site" delay={200} triggered={entranceComplete} />
              <br />
              <ScrambleIn text="Tem Brecha" delay={500} triggered={entranceComplete} />
            </h1>

            <motion.p
              className="max-w-sm text-[13px] leading-relaxed text-white/60 sm:text-[15px]"
              initial={{ opacity: 0, y: 25 }}
              animate={entranceComplete ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
            >
              O ARGOS varre seu site sem parar, atrás de chaves expostas, bancos de dados
              abertos, headers ausentes e tecnologia desatualizada — e transforma cada achado num
              prompt pronto pra colar direto no seu editor.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={entranceComplete ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.35, ease: [0.215, 0.61, 0.355, 1] }}
            >
              <ScanForm />
            </motion.div>
          </div>

          <h1 className="text-left text-[clamp(40px,10vw,100px)] font-light leading-[0.95] tracking-[-0.03em] text-white md:text-right">
            <ScrambleIn text="Achamos" delay={700} triggered={entranceComplete} />
            <br />
            <ScrambleIn text="Primeiro" delay={1000} triggered={entranceComplete} />
          </h1>
        </motion.div>
      </div>
    </section>
  );
}
