// Mesmo padrão de lenis.ts/transition.ts: um ponto único pra qualquer botão disparar a
// transição de partículas (montada uma vez em App.tsx) sem precisar de Context.
type PlayFn = (onCovered: () => void) => void;

export const particleTransitionRef: { play: PlayFn | null } = { play: null };
