import type Lenis from 'lenis';

// Instância única do Lenis, criada em App.tsx — outros componentes (o Navbar, por exemplo)
// leem daqui pra rolar a página sem precisar de Context/prop-drilling pra um scroll global.
export const lenisRef: { current: Lenis | null } = { current: null };

export function scrollToY(y: number, opts?: { immediate?: boolean }) {
  if (lenisRef.current) lenisRef.current.scrollTo(y, { duration: opts?.immediate ? 0 : 1.2 });
  else window.scrollTo({ top: y, behavior: opts?.immediate ? 'auto' : 'smooth' });
}
