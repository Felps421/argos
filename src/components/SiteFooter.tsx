import { Github, Linkedin, Twitter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandMark from './BrandMark';
import { particleTransitionRef } from '../lib/particleTransition';
import { CONTACT_EMAIL } from '../constants';

// Rodapé compartilhado entre Scan e Planos (a Home já tem o dela, em sections/Footer.tsx).
// Links, e-mail e redes sociais são só o essencial pra fechar a página — sem newsletter nem
// links de política de privacidade/termos, já que essas páginas não existem ainda. Redes
// sociais apontam pra "#" de propósito: é só trocar pelo link de verdade quando tiver um.
const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Scanner', path: '/scan' },
  { label: 'Planos', path: '/planos' },
];

const SOCIALS = [
  { label: 'GitHub', href: '#', icon: Github },
  { label: 'Twitter/X', href: '#', icon: Twitter },
  { label: 'LinkedIn', href: '#', icon: Linkedin },
];

export default function SiteFooter() {
  const navigate = useNavigate();

  const goTo = (path: string) => {
    const go = () => navigate(path);
    if (particleTransitionRef.play) particleTransitionRef.play(go);
    else go();
  };

  return (
    <footer className="relative mx-auto mt-24 max-w-6xl px-6 pb-10 pt-16 sm:px-10">
      <div className="grid grid-cols-1 gap-12 border-t border-white/10 pt-14 sm:grid-cols-3 sm:gap-8">
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <BrandMark className="h-7 w-7" />
            <span className="text-[15px] font-medium tracking-tight text-white">ARGOS</span>
          </div>
          <p className="max-w-xs text-[13px] leading-relaxed text-white/40">
            Varredura contínua e prompts de correção prontos — pra quem cuida do próprio site
            sem ter um time de segurança por trás.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-[12px] uppercase tracking-[0.15em] text-white/40">Navegação</h3>
          <nav className="flex flex-col gap-2.5">
            {NAV_LINKS.map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => goTo(link.path)}
                className="w-fit text-left text-[14px] text-white/60 transition-colors duration-200 hover:text-red-400"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        <div>
          <h3 className="mb-4 text-[12px] uppercase tracking-[0.15em] text-white/40">Contato</h3>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-[14px] text-white/60 transition-colors duration-200 hover:text-red-400"
          >
            {CONTACT_EMAIL}
          </a>
          <div className="mt-5 flex items-center gap-3">
            {SOCIALS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/50 transition-colors duration-200 hover:border-red-400/50 hover:text-red-400"
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
        <p className="text-[12px] text-white/25">© 2026 ARGOS. Todos os direitos reservados.</p>
        <div className="flex items-center gap-2 text-[12px] text-white/30">
          <span>Desenvolvido por</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#F6F6F3] p-1">
            <img src="/assents/logo.png" alt="Logo do desenvolvedor" className="h-full w-full object-contain" />
          </span>
        </div>
      </div>
    </footer>
  );
}
