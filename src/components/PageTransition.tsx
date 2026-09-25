import { useEffect, useRef, useState } from 'react';
import { transitionRef, type TransitionOrigin } from '../lib/transition';

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Transição de tela cheia: um círculo preto nasce no ponto clicado e cobre a tela, segura um
 * instante com um indicador de carregamento, e reabre no mesmo ponto — dando a sensação de ir
 * pra "outra página" mesmo sem ter uma rota de verdade ainda (`onCovered` roda enquanto está
 * coberto, é aí que quem chamou troca o que precisar por trás do véu).
 */
export default function PageTransition() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const origin = useRef<TransitionOrigin>({ x: 0, y: 0 });
  const timers = useRef<number[]>([]);

  useEffect(() => {
    transitionRef.play = (o, onCovered) => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      origin.current = o;

      if (reduceMotion()) {
        // Mais suave, não zero: um corte rápido de opacidade em vez do círculo crescendo.
        setVisible(true);
        setExpanded(true);
        setLoading(true);
        timers.current.push(
          window.setTimeout(() => {
            onCovered();
            setLoading(false);
            setExpanded(false);
            timers.current.push(window.setTimeout(() => setVisible(false), 200));
          }, 250),
        );
        return;
      }

      setVisible(true);
      setExpanded(false);
      // Duplo rAF: garante que o navegador pinte o círculo em 0% antes de crescer — sem isso,
      // o primeiro frame já nasce cobrindo a tela e a transição de clip-path nunca é vista.
      requestAnimationFrame(() => requestAnimationFrame(() => setExpanded(true)));

      timers.current.push(
        window.setTimeout(() => {
          onCovered();
          setLoading(true);
          timers.current.push(
            window.setTimeout(() => {
              setLoading(false);
              setExpanded(false);
              timers.current.push(window.setTimeout(() => setVisible(false), 700));
            }, 420),
          );
        }, 650),
      );
    };

    return () => {
      transitionRef.play = null;
      timers.current.forEach(clearTimeout);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-black"
      style={{
        clipPath: `circle(${expanded ? 150 : 0}% at ${origin.current.x}px ${origin.current.y}px)`,
        transition: `clip-path 650ms ${expanded ? 'cubic-bezier(0.16,1,0.3,1)' : 'cubic-bezier(0.87,0,0.13,1)'}`,
      }}
      aria-hidden="true"
    >
      <div className={`flex gap-2 transition-opacity duration-200 ${loading ? 'opacity-100' : 'opacity-0'}`}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-pulse rounded-full bg-white/70"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
