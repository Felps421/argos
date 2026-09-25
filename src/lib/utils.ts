import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utilitário padrão do shadcn: junta classes condicionais (clsx) e resolve conflitos do
// Tailwind (tailwind-merge) — base pra qualquer componente futuro em components/ui.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
