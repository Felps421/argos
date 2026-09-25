import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ScrambleText from '../components/ScrambleText';
import { LiquidMetalButton } from '../components/ui/liquid-metal-button';
import { particleTransitionRef } from '../lib/particleTransition';

const LAYERS = [
  { label: 'Camada 1', name: 'Varredura' },
  { label: 'Camada 2', name: 'Diagnóstico' },
  { label: 'Camada 3', name: 'Correção' },
];

const HEADING_WORDS = ['Três', 'camadas.', 'Zero', 'fricção.'];

export default function Architecture() {
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);
  const navigate = useNavigate();

  // Botão principal pra segunda página — vai direto pra `/scan`, sem passar pelo campo do Hero.
  // Sem URL específica digitada aqui, então a página de scan usa o domínio de demonstração.
  const goToScan = () => {
    const go = () => navigate('/scan');
    if (particleTransitionRef.play) particleTransitionRef.play(go);
    else go();
  };

  return (
    <section className="relative min-h-screen w-full bg-black">
      <div className="mx-auto max-w-3xl px-6 py-32">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.0 }}
        >
          <p className="mb-8 text-[13px] uppercase tracking-[0.2em] text-white/40 sm:text-[14px]">Arquitetura</p>

          <h2 className="mb-10 text-[clamp(28px,6vw,56px)] font-light leading-[1.15] tracking-[-0.02em] text-white">
            {HEADING_WORDS.map((word, i) => (
              <motion.span
                key={word}
                className="inline-block"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
                {i < HEADING_WORDS.length - 1 ? ' ' : ''}
              </motion.span>
            ))}
          </h2>

          <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-white/45 sm:text-[17px]">
            A camada de varredura lê seu site como um visitante leria. A de diagnóstico pesa
            cada achado pelo risco real. A de correção transforma cada um num prompt pronto pra
            colar e rodar.
          </p>
        </motion.div>

        <motion.div
          className="mt-20 flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.2, delay: 0.4 }}
        >
          {LAYERS.map((layer, i) => (
            <motion.div
              key={layer.label}
              className="flex h-[72px] w-full max-w-md items-center justify-between rounded-lg border border-white/10 px-6"
              onMouseEnter={() => setHoveredLayer(i)}
              onMouseLeave={() => setHoveredLayer((v) => (v === i ? null : v))}
              whileHover={{ scale: 1.015, borderColor: 'rgba(255,255,255,0.3)' }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-[12px] uppercase tracking-[0.15em] text-white/30">{layer.label}</span>
              <ScrambleText text={layer.name} isHovered={hoveredLayer === i} className="text-[16px] font-light text-white sm:text-[18px]" />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <LiquidMetalButton label="Meu Site É Seguro?" onClick={goToScan} />
        </motion.div>
      </div>
    </section>
  );
}
