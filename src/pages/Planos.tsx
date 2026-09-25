import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import StrokeText from '../components/StrokeText';
import { LiquidMetalButton } from '../components/ui/liquid-metal-button';
import SiteFooter from '../components/SiteFooter';
import { CONTACT_EMAIL } from '../constants';

// Terceira página do site — fecha a estrutura: quem faz o ARGOS (Sobre), quanto custa
// (Planos) e como falar com a gente (Contato), tudo numa página só, com o vídeo
// "pag3-fundo" fixo atrás das três seções. Preços e textos ainda são fictícios — a ideia
// aqui é fechar a experiência de navegação, não o modelo de negócio de verdade.

interface Tier {
  name: string;
  price: string;
  sites: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

const TIERS: Tier[] = [
  {
    name: 'Start',
    price: 'R$49',
    sites: 'Até 5 sites',
    description: 'Pra quem cuida de um site (ou dois) no tempo livre.',
    features: ['5 sites monitorados', 'Varredura semanal', 'Relatório com prompt de correção', 'Suporte por e-mail'],
    cta: 'Começar',
  },
  {
    name: 'Agência',
    price: 'R$89',
    sites: 'Até 10 sites',
    description: 'Pra quem já vive entre vários projetos de cliente ao mesmo tempo.',
    features: [
      '10 sites monitorados',
      'Varredura diária',
      'Relatório com prompt de correção',
      'Alertas em tempo real',
      'Suporte prioritário',
    ],
    cta: 'Assinar',
    popular: true,
  },
  {
    name: 'Ilimitado',
    price: 'R$179',
    sites: 'Sites ilimitados',
    description: 'Pra agências e times que não querem contar site por site.',
    features: [
      'Sites ilimitados',
      'Varredura diária',
      'Relatório com prompt de correção',
      'Alertas em tempo real',
      'Suporte prioritário',
      'Acesso antecipado a novas checagens',
    ],
    cta: 'Assinar',
  },
];

const VALUES = [
  { title: 'Sem enrolação', desc: 'Cada achado vem com o prompt de correção pronto — não um relatório de 40 páginas.' },
  { title: 'Feito pra quem programa sozinho', desc: 'Você não precisa de um time de segurança pra manter seu site seguro.' },
  { title: 'Sempre de olho', desc: 'O ARGOS aprende o normal do seu site e avisa na hora que algo muda.' },
];

function PricingCard({ tier }: { tier: Tier }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7 }}
      className={`relative flex flex-col gap-6 rounded-xl border p-7 backdrop-blur-md sm:p-8 ${
        tier.popular ? 'border-white/25 bg-white/[0.07]' : 'border-white/10 bg-white/[0.03]'
      }`}
    >
      {tier.popular && (
        <span className="absolute -top-3 left-7 rounded-full bg-red-500 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-white">
          Mais popular
        </span>
      )}

      <div>
        <h3 className="text-[20px] font-medium text-white sm:text-[22px]">{tier.name}</h3>
        <p className="mt-1 text-[13px] text-white/40">{tier.sites}</p>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-[clamp(36px,6vw,48px)] font-light leading-none tracking-[-0.02em] text-white">
          {tier.price}
        </span>
        <span className="text-[13px] text-white/40">/mês</span>
      </div>

      <p className="text-[13px] leading-relaxed text-white/50 sm:text-[14px]">{tier.description}</p>

      <ul className="flex-1 space-y-2.5">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-[13px] text-white/70 sm:text-[14px]">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" strokeWidth={2.5} />
            {feature}
          </li>
        ))}
      </ul>

      {tier.popular ? (
        <div className="pt-1">
          <LiquidMetalButton label={tier.cta} />
        </div>
      ) : (
        <button
          type="button"
          className="w-full rounded-full border border-white/20 py-3 text-[13px] text-white/80 transition-colors duration-200 hover:border-white/50 hover:text-white"
        >
          {tier.cta}
        </button>
      )}
    </motion.div>
  );
}

function SectionKicker({ text, trigger = 'inView' }: { text: string; trigger?: 'mount' | 'inView' }) {
  return (
    <StrokeText
      text={text}
      strokeColor="#FF2B1F"
      fillColor="#FFFFFF"
      strokeWidth={1.2}
      drawDuration={1.4}
      fillDelay={0.15}
      stagger={0.04}
      ease="power2.out"
      trigger={trigger}
      fillMode="wipe"
      fontSize="clamp(40px, 9vw, 88px)"
      fontWeight={800}
      letterSpacing={-2}
    />
  );
}

export default function Planos() {
  return (
    <main className="relative min-h-screen w-full bg-black">
      <video
        src="/assents/video/pag3-fundo.mp4"
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 -z-10 h-full w-full object-cover"
      />

      {/* ---------- Sobre ---------- */}
      <section className="relative mx-auto max-w-4xl px-6 pb-24 pt-40 text-center sm:px-10">
        <SectionKicker text="Sobre" trigger="mount" />

        <motion.h2
          className="mx-auto mt-8 max-w-2xl text-[clamp(22px,4vw,32px)] font-light leading-snug text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9 }}
        >
          Ninguém deveria descobrir que o próprio site estava vazando dados pela palavra de um
          estranho na internet.
        </motion.h2>

        <motion.p
          className="mx-auto mt-6 max-w-xl text-[14px] leading-relaxed text-white/50 sm:text-[15px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 0.1 }}
        >
          O ARGOS nasceu pra resolver isso: uma varredura simples, sem jargão, que aponta
          exatamente o que está exposto — e como corrigir, sem precisar contratar uma auditoria
          cara só pra saber o básico.
        </motion.p>

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-10 text-left sm:grid-cols-3 sm:gap-8">
          {VALUES.map((value, i) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
            >
              <h3 className="mb-2 text-[14px] font-normal text-white sm:text-[16px]">{value.title}</h3>
              <p className="text-[12px] leading-relaxed text-white/45 sm:text-[13px]">{value.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- Planos ---------- */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-24 text-center sm:px-10">
        <SectionKicker text="Planos" />

        <motion.p
          className="mx-auto mt-8 max-w-md text-[14px] leading-relaxed text-white/50 sm:text-[15px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9 }}
        >
          Preços simples, sem letra pequena. Cancele quando quiser.
        </motion.p>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
          {TIERS.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>
      </section>

      {/* ---------- Contato ---------- */}
      <section className="relative mx-auto max-w-3xl px-6 pb-32 pt-24 text-center sm:px-10">
        <SectionKicker text="Contato" />

        <motion.h2
          className="mx-auto mt-8 max-w-lg text-[clamp(22px,4vw,32px)] font-light leading-snug text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9 }}
        >
          Ainda com dúvida? Fala com a gente.
        </motion.h2>

        <motion.p
          className="mx-auto mt-5 max-w-sm text-[13px] leading-relaxed text-white/45 sm:text-[14px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 0.1 }}
        >
          Respondemos em até 1 dia útil.
        </motion.p>

        <motion.div
          className="mt-10 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="rounded-full border border-white/20 px-6 py-3 text-[13px] text-white/80 transition-colors duration-200 hover:border-white/50 hover:text-white"
          >
            {CONTACT_EMAIL}
          </a>
        </motion.div>
      </section>

      <SiteFooter />
    </main>
  );
}
