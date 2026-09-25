import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LiquidMetalButton } from './ui/liquid-metal-button';
import { particleTransitionRef } from '../lib/particleTransition';

function normalizeUrl(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    if (!/\.[a-z]{2,}$/i.test(url.hostname) && url.hostname !== 'localhost') return null;
    return url.href;
  } catch {
    return null;
  }
}

interface ScanFormProps {
  // Quando informado, chama isso com a URL validada em vez de navegar pro /scan — é o que a
  // própria página de Scan usa pra reiniciar a varredura com um novo endereço sem sair da rota.
  onSubmit?: (url: string) => void;
}

/**
 * Campo de URL do Hero — secundário, não é o caminho principal pra segunda página (esse é o
 * botão no fim da seção "Architecture"). Ao validar, dispara a transição de partículas ("ARGOS"
 * se formando em vermelho) e navega pra `/scan` levando a URL digitada.
 */
export default function ScanForm({ onSubmit }: ScanFormProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Sem argumento, pra servir tanto o `onSubmit` do form (Enter) quanto o `onClick` do
  // LiquidMetalButton (que não é um <button type="submit"> de verdade).
  const submit = () => {
    const normalized = normalizeUrl(value);
    if (!normalized) {
      setError('Digite um endereço válido, tipo seusite.com.br');
      return;
    }
    setError('');

    if (onSubmit) {
      onSubmit(normalized);
      return;
    }

    const go = () => navigate('/scan', { state: { url: normalized } });
    if (particleTransitionRef.play) particleTransitionRef.play(go);
    else go();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md" noValidate>
      <div className="shimmer-sweep relative flex h-12 items-center overflow-hidden rounded-full border border-white/15 bg-white/10 backdrop-blur-md transition-[border-color,box-shadow] duration-300 focus-within:border-white/40 focus-within:shadow-[0_0_0_4px_rgba(255,255,255,0.08)]">
        <span className="pl-5 text-[14px] text-white/40" aria-hidden="true">
          https://
        </span>
        <label htmlFor="hero-url" className="sr-only">
          Endereço do site
        </label>
        <input
          id="hero-url"
          type="text"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="seusite.com.br"
          value={value}
          onChange={(e) => {
            setValue(e.target.value.replace(/^\s*https?:\/\//i, ''));
            if (error) setError('');
          }}
          className="h-full min-w-0 flex-1 bg-transparent pl-0.5 text-[16px] text-white placeholder-white/30 outline-none"
        />
        <div className="flex-shrink-0 pr-0.5">
          <LiquidMetalButton label="Vasculhar" onClick={submit} />
        </div>
      </div>
      <p className={`mt-2 text-[12px] text-white/50 transition-opacity duration-200 ${error ? 'opacity-100' : 'opacity-0'}`} role="status">
        {error || ' '}
      </p>
    </form>
  );
}
