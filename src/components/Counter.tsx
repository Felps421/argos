import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface CounterProps {
  to: number;
  suffix?: string;
  duration?: number; // ms
}

/** Número que sobe do zero até o valor final quando entra na tela — dispara uma única vez. */
export default function Counter({ to, suffix = '', duration = 1600 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // amount mais baixo + margin positiva: dispara antes do número estar 100% visível, pra não
  // perder o gatilho num scroll rápido de celular (o pai já cuida do fade-in mais cedo ainda).
  const inView = useInView(ref, { once: true, amount: 0.2, margin: '0px 0px 200px 0px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4); // power4.out
      setDisplay(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}
