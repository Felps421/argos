import { useMemo } from 'react';
import { motion, useReducedMotion, type Easing } from 'framer-motion';

interface StrokeTextProps {
  text: string;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  drawDuration?: number;
  fillDelay?: number;
  stagger?: number;
  ease?: string;
  trigger?: 'mount' | 'inView';
  fillMode?: 'wipe' | 'fade';
  fontSize?: number | string;
  fontWeight?: number;
  letterSpacing?: number;
  reverse?: boolean;
  className?: string;
}

// Aproximação de nomes de ease no estilo GSAP pro formato que o Framer Motion entende
// (curva cúbica ou nome nativo) — não existe GSAP no projeto, só framer-motion.
const EASE_MAP: Record<string, Easing> = {
  'power1.out': [0.25, 0.46, 0.45, 0.94],
  'power1.in': [0.55, 0.06, 0.68, 0.19],
  'power1.inOut': [0.45, 0, 0.55, 1],
  'power2.out': [0.16, 1, 0.3, 1],
  'power2.in': [0.65, 0, 0.9, 0.35],
  'power2.inOut': [0.65, 0, 0.35, 1],
  'power3.out': [0.22, 1, 0.36, 1],
  'power3.in': [0.7, 0, 0.84, 0],
  'power4.out': [0.19, 1, 0.22, 1],
  linear: 'linear',
};

function resolveEase(ease?: string): Easing {
  if (!ease) return EASE_MAP['power2.out'];
  return EASE_MAP[ease] ?? 'easeOut';
}

/**
 * Título grande com o traço "se desenhando" e depois se preenchendo, letra por letra.
 * Sem GSAP nem conversão de texto em path: o "desenho" é um wipe de clip-path sobre uma
 * camada com -webkit-text-stroke (só o contorno), e o preenchimento é o mesmo wipe sobre o
 * texto sólido por cima, atrasado por `fillDelay` — as duas camadas ficam visíveis ao final
 * (contorno colorido + miolo preenchido), que é o efeito "StrokeText" propriamente.
 */
export default function StrokeText({
  text,
  strokeColor = '#A78BFA',
  fillColor = '#F8FAFC',
  strokeWidth = 1.4,
  drawDuration = 1.6,
  fillDelay = 0.2,
  stagger = 0.05,
  ease = 'power2.out',
  trigger = 'mount',
  fillMode = 'wipe',
  fontSize = 128,
  fontWeight = 800,
  letterSpacing = -4,
  reverse = false,
  className = '',
}: StrokeTextProps) {
  const prefersReduced = useReducedMotion();
  const chars = useMemo(() => Array.from(text), [text]);
  const easeValue = resolveEase(ease);

  const clipHidden = reverse ? 'inset(0 0% 0 100%)' : 'inset(0 100% 0 0%)';
  const clipVisible = 'inset(0 0% 0 0%)';

  const sharedStyle = { fontSize, fontWeight, fontFamily: '"Anton SC", sans-serif' };

  if (prefersReduced) {
    return (
      <span className={className} style={{ ...sharedStyle, color: fillColor }}>
        {text}
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-wrap ${className}`} style={sharedStyle} aria-label={text}>
      {chars.map((char, i) => {
        if (char === ' ') {
          return (
            <span key={i} aria-hidden="true" style={{ width: '0.32em' }}>
              &nbsp;
            </span>
          );
        }

        const delay = i * stagger;

        return (
          <span
            key={i}
            className="relative inline-block"
            aria-hidden="true"
            style={{ marginRight: letterSpacing ? `${letterSpacing}px` : undefined }}
          >
            {/* preenchimento — estabelece o tamanho da caixa */}
            <motion.span
              className="relative select-none"
              style={{ color: fillColor }}
              initial={fillMode === 'wipe' ? { clipPath: clipHidden } : { opacity: 0 }}
              animate={
                trigger === 'mount' ? (fillMode === 'wipe' ? { clipPath: clipVisible } : { opacity: 1 }) : undefined
              }
              whileInView={
                trigger === 'inView' ? (fillMode === 'wipe' ? { clipPath: clipVisible } : { opacity: 1 }) : undefined
              }
              viewport={trigger === 'inView' ? { once: true, amount: 0.6 } : undefined}
              transition={{ duration: drawDuration * 0.7, delay: delay + fillDelay, ease: easeValue }}
            >
              {char}
            </motion.span>
            {/* traço — sobreposto, só o contorno visível */}
            <motion.span
              className="absolute inset-0 select-none"
              style={{ WebkitTextStroke: `${strokeWidth}px ${strokeColor}`, color: 'transparent' }}
              initial={{ clipPath: clipHidden }}
              animate={trigger === 'mount' ? { clipPath: clipVisible } : undefined}
              whileInView={trigger === 'inView' ? { clipPath: clipVisible } : undefined}
              viewport={trigger === 'inView' ? { once: true, amount: 0.6 } : undefined}
              transition={{ duration: drawDuration, delay, ease: easeValue }}
            >
              {char}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
