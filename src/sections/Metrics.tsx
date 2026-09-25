import { motion } from 'framer-motion';
import Counter from '../components/Counter';
import { VIDEOS } from '../constants';

const METRICS = [
  { to: 99, suffix: '%', label: 'Falhas Encontradas' },
  { to: 40, suffix: '+', label: 'Checagens por Varredura' },
  { to: 12, suffix: 's', label: 'Tempo Médio de Varredura' },
];

export default function Metrics() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <video src={VIDEOS.metrics} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-32 pt-32">
        <motion.p
          className="mb-20 text-center text-[13px] uppercase tracking-[0.2em] text-white/40 sm:text-[14px]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2 }}
        >
          Em Números
        </motion.p>

        <div className="grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-8">
          {METRICS.map((metric, i) => (
            <motion.div
              key={metric.label}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
            >
              <div className="text-[clamp(48px,10vw,96px)] font-light leading-none tracking-[-0.04em] text-white tabular-nums">
                <Counter to={metric.to} suffix={metric.suffix} duration={1600 + i * 200} />
              </div>
              <div className="mt-4 text-[13px] tracking-wide text-white/40 sm:text-[15px]">{metric.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
