import { useEffect, useRef, useState } from 'react';

interface IntroVideoProps {
  src: string;
  onDone: () => void;
}

/**
 * Vídeo de abertura: a lhama olha pra tela, escaneia e revela "ARGOS" — toca uma vez, antes do
 * Hero aparecer. Sai sozinho quando o vídeo termina, tem botão de pular, e nunca prende quem
 * pediu movimento reduzido. App.tsx só monta isso quando a sessão ainda não viu (sessionStorage).
 */
export default function IntroVideo({ src, onDone }: IntroVideoProps) {
  const [exiting, setExiting] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const doneRef = useRef(false);
  const reduceMotion = useRef(matchMedia('(prefers-reduced-motion: reduce)').matches).current;

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setExiting(true);
    window.setTimeout(onDone, reduceMotion ? 150 : 650);
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    if (reduceMotion) {
      // Não prende quem pediu menos movimento atrás de um vídeo de 8s.
      finish();
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }

    const skipTimer = window.setTimeout(() => setShowSkip(true), 1200);
    const safetyTimer = window.setTimeout(finish, 9000); // se o vídeo travar, não trava o site

    return () => {
      document.body.style.overflow = previousOverflow;
      clearTimeout(skipTimer);
      clearTimeout(safetyTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black transition-all duration-700 ease-out"
      style={{ opacity: exiting ? 0 : 1, transform: exiting ? 'scale(1.08)' : 'scale(1)' }}
      onClick={finish}
      role="presentation"
    >
      {!reduceMotion && <video src={src} autoPlay muted playsInline onEnded={finish} className="h-full w-full object-contain" />}

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          finish();
        }}
        className="absolute bottom-8 right-8 rounded-full border border-white/20 px-4 py-2 text-[12px] text-white/60 transition-opacity duration-300 hover:text-white"
        style={{ opacity: showSkip ? 1 : 0, pointerEvents: showSkip ? 'auto' : 'none' }}
      >
        Pular →
      </button>
    </div>
  );
}
