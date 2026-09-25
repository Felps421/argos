import { motion } from 'framer-motion';
import { VIDEOS } from '../constants';

const FEATURES = [
  { title: 'Varredura Ativa', desc: 'Percorre headers, cookies e arquivos públicos atrás de brechas.' },
  { title: 'Detecção de Vazamento', desc: 'Encontra chaves, tokens e credenciais expostas no seu código.' },
  { title: 'Classificação de Risco', desc: 'Ordena cada achado do crítico ao informativo.' },
  { title: 'Prompt de Correção', desc: 'Transforma o problema num prompt pronto pra colar e rodar.' },
];

export default function Technology() {
  return (
    <section className="relative h-screen h-[100dvh] w-full overflow-hidden">
      <video src={VIDEOS.technology} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />

      <div className="relative z-10 flex h-full flex-col px-8 py-12 sm:px-12 sm:py-16 md:px-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <motion.h2
            className="text-[clamp(36px,8vw,72px)] font-light leading-[0.95] tracking-[-0.03em] text-white"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.0 }}
          >
            Sempre
            <br />
            Vigiando
          </motion.h2>

          <motion.p
            className="max-w-xs text-[13px] leading-relaxed text-white/50 sm:text-[15px] md:pt-2 md:text-right"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.0, delay: 0.2 }}
          >
            O ARGOS aprende o formato normal do seu site na primeira varredura. A partir daí,
            cada nova checagem é mais rápida, e qualquer achado novo salta aos olhos na hora.
          </motion.p>
        </div>

        <div className="flex-1" />

        <motion.div
          className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.0, delay: 0.3 }}
        >
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
            >
              <h3 className="mb-2 text-[14px] font-normal text-white sm:text-[16px]">{feature.title}</h3>
              <p className="text-[12px] leading-relaxed text-white/40 sm:text-[14px]">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
