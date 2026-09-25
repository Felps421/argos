import { useRef } from 'react';
import { motion, useMotionTemplate, useScroll, useSpring, useTransform } from 'framer-motion';
import { VIDEOS } from '../constants';

export default function CinematicText() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 15, damping: 32, mass: 1.8 });

  const y = useTransform(smoothProgress, [0, 1], [60, -120]);
  const opacity = useTransform(smoothProgress, [0.3, 0.5], [0, 1]);
  const transform = useMotionTemplate`rotateX(24deg) translateY(${y}px) translateZ(15px)`;

  return (
    <section ref={sectionRef} className="relative h-screen h-[100dvh] w-full overflow-hidden">
      <video src={VIDEOS.cinematic} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[180px]"
        style={{ background: 'linear-gradient(to bottom, #010103, transparent)' }}
      />

      <div className="relative z-10 flex h-full items-center justify-center" style={{ perspective: 400 }}>
        <motion.p
          className="max-w-5xl select-none px-6 text-center text-[22px] font-normal leading-[1.35] tracking-[-0.02em] text-white sm:px-12 sm:text-[30px] md:text-[36px] lg:text-[42px]"
          style={{ transform, opacity }}
        >
          O ARGOS é um scanner de segurança feito pro jeito que os sites realmente quebram. Ele
          lê os headers, caça chaves vazadas, confere toda porta que uma configuração esquecida
          deixou aberta. Nada é corrigido sozinho — cada achado vira um prompt, pronto pra colar
          no Claude, no Cursor ou no ChatGPT. Quem decide é você. O ARGOS só garante que você
          nunca deixe passar o que já está exposto.
        </motion.p>
      </div>
    </section>
  );
}
