import { motion } from 'framer-motion';

interface SquashHamburgerProps {
  isOpen: boolean;
  width: number;
  height: number;
  barHeight: number;
  className?: string;
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 20 };

/** Hamburger de 3 traços que "esmaga" em X: a barra de cima desce e gira 45°, a do meio
 * desaparece, a de baixo sobe e gira -45° — todas convergindo na mesma linha central. */
export default function SquashHamburger({ isOpen, width, height, barHeight, className }: SquashHamburgerProps) {
  const centerOffset = (height - barHeight) / 2;

  return (
    <span className={`relative block ${className ?? ''}`} style={{ width, height }}>
      <motion.span
        className="absolute inset-x-0 rounded-full bg-white"
        style={{ top: 0, height: barHeight }}
        animate={{ y: isOpen ? centerOffset : 0, rotate: isOpen ? 45 : 0 }}
        transition={spring}
      />
      <motion.span
        className="absolute inset-x-0 rounded-full bg-white"
        style={{ top: centerOffset, height: barHeight }}
        animate={{ opacity: isOpen ? 0 : 1, scaleX: isOpen ? 0 : 1 }}
        transition={spring}
      />
      <motion.span
        className="absolute inset-x-0 rounded-full bg-white"
        style={{ top: height - barHeight, height: barHeight }}
        animate={{ y: isOpen ? -centerOffset : 0, rotate: isOpen ? -45 : 0 }}
        transition={spring}
      />
    </span>
  );
}
