import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BrandMark from './BrandMark';
import ScrambleText from './ScrambleText';
import SquashHamburger from './SquashHamburger';
import { scrollToY } from '../lib/lenis';
import { particleTransitionRef } from '../lib/particleTransition';

interface NavbarProps {
  entranceComplete: boolean;
}

const menuSpring = { type: 'spring' as const, stiffness: 350, damping: 28 };

export default function Navbar({ entranceComplete }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverAbout, setHoverAbout] = useState(false);
  const [hoverMetrics, setHoverMetrics] = useState(false);
  const [hoverScan, setHoverScan] = useState(false);
  const [hoverPlanos, setHoverPlanos] = useState(false);
  const navigate = useNavigate();

  const goTo = (multiplier: number) => {
    scrollToY(window.innerHeight * multiplier);
    setMenuOpen(false);
  };

  // Atalho escondido no menu pra quem já quer ir direto pro scan — mesma transição de
  // partículas dos outros dois caminhos.
  const goToScan = () => {
    setMenuOpen(false);
    const go = () => navigate('/scan');
    if (particleTransitionRef.play) particleTransitionRef.play(go);
    else go();
  };

  // Terceira página (Sobre + Planos + Contato) — mesma transição de partículas do Scan.
  const goToPlanos = () => {
    setMenuOpen(false);
    const go = () => navigate('/planos');
    if (particleTransitionRef.play) particleTransitionRef.play(go);
    else go();
  };

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-50 h-20 bg-transparent"
      initial={{ opacity: 0 }}
      animate={{ opacity: entranceComplete ? 1 : 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex h-full items-center justify-between px-4">
        {/* ---------- Desktop (sm e acima) ---------- */}
        <div className="hidden items-center gap-2 sm:flex">
          <div className={`${menuOpen ? 'hidden md:flex' : 'flex'} h-12 items-center gap-2.5`}>
            <BrandMark className="h-8 w-8" />
            <span className="text-[16px] font-medium tracking-tight text-white">ARGOS</span>
          </div>

          <motion.div
            className="flex h-12 items-center overflow-hidden rounded-[14px] bg-white/15 backdrop-blur-md"
            animate={{ width: menuOpen ? 440 : 48 }}
            transition={menuSpring}
          >
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              className={
                menuOpen
                  ? 'ml-1.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[11px] bg-white/10 hover:bg-white/20'
                  : 'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[14px]'
              }
            >
              <SquashHamburger isOpen={menuOpen} width={18} height={12} barHeight={1.5} />
            </button>

            <motion.nav
              className="flex items-center gap-6 pl-2 pr-6"
              initial={false}
              animate={{ opacity: menuOpen ? 1 : 0, x: menuOpen ? 0 : 15 }}
              transition={{ duration: 0.3 }}
              aria-hidden={!menuOpen}
            >
              <button
                type="button"
                onClick={() => goTo(1)}
                onMouseEnter={() => setHoverAbout(true)}
                onMouseLeave={() => setHoverAbout(false)}
                tabIndex={menuOpen ? 0 : -1}
                className="whitespace-nowrap text-[16px] font-normal text-white/85 hover:text-white"
              >
                <ScrambleText text="Sobre" isHovered={hoverAbout} />
              </button>
              <button
                type="button"
                onClick={() => goTo(2)}
                onMouseEnter={() => setHoverMetrics(true)}
                onMouseLeave={() => setHoverMetrics(false)}
                tabIndex={menuOpen ? 0 : -1}
                className="whitespace-nowrap text-[16px] font-normal text-white/85 hover:text-white"
              >
                <ScrambleText text="Números" isHovered={hoverMetrics} />
              </button>
              <button
                type="button"
                onClick={goToScan}
                onMouseEnter={() => setHoverScan(true)}
                onMouseLeave={() => setHoverScan(false)}
                tabIndex={menuOpen ? 0 : -1}
                className="whitespace-nowrap text-[16px] font-normal text-white/85 hover:text-white"
              >
                <ScrambleText text="Scan" isHovered={hoverScan} />
              </button>
              <button
                type="button"
                onClick={goToPlanos}
                onMouseEnter={() => setHoverPlanos(true)}
                onMouseLeave={() => setHoverPlanos(false)}
                tabIndex={menuOpen ? 0 : -1}
                className="whitespace-nowrap text-[16px] font-normal text-white/85 hover:text-white"
              >
                <ScrambleText text="Planos" isHovered={hoverPlanos} />
              </button>
            </motion.nav>
          </motion.div>
        </div>

        {/* ---------- Mobile (abaixo de sm) ---------- */}
        <div className="flex flex-1 items-center gap-2 sm:hidden">
          <motion.div
            className="flex h-9 flex-shrink-0 items-center gap-2 overflow-hidden"
            animate={{ width: menuOpen ? 0 : 'auto', opacity: menuOpen ? 0 : 1 }}
            transition={menuSpring}
          >
            <BrandMark className="h-6 w-6" />
            <span className="whitespace-nowrap text-[13px] font-medium tracking-tight text-white">ARGOS</span>
          </motion.div>

          <motion.div
            className="flex h-9 items-center overflow-hidden rounded-[10px] bg-white/15 backdrop-blur-md"
            animate={{ width: menuOpen ? '100%' : 40 }}
            transition={menuSpring}
          >
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              className={
                menuOpen
                  ? 'ml-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[8px] bg-white/10'
                  : 'flex h-9 w-10 flex-shrink-0 items-center justify-center rounded-[10px]'
              }
            >
              <SquashHamburger isOpen={menuOpen} width={15} height={10} barHeight={1.2} />
            </button>

            <motion.nav
              className="flex items-center gap-4 pl-2 pr-4"
              initial={false}
              animate={{ opacity: menuOpen ? 1 : 0, x: menuOpen ? 0 : 15 }}
              transition={{ duration: 0.3 }}
              aria-hidden={!menuOpen}
            >
              <button type="button" onClick={() => goTo(1)} tabIndex={menuOpen ? 0 : -1} className="whitespace-nowrap text-[13px] text-white/85">
                Sobre
              </button>
              <button type="button" onClick={() => goTo(2)} tabIndex={menuOpen ? 0 : -1} className="whitespace-nowrap text-[13px] text-white/85">
                Números
              </button>
              <button type="button" onClick={goToScan} tabIndex={menuOpen ? 0 : -1} className="whitespace-nowrap text-[13px] text-white/85">
                Scan
              </button>
              <button type="button" onClick={goToPlanos} tabIndex={menuOpen ? 0 : -1} className="whitespace-nowrap text-[13px] text-white/85">
                Planos
              </button>
            </motion.nav>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
