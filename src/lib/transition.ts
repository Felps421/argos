// Igual ao lenis.ts: um ponto único pra qualquer botão disparar a transição de tela cheia
// (montada uma vez em App.tsx) sem precisar de Context.
export interface TransitionOrigin {
  x: number;
  y: number;
}

type PlayFn = (origin: TransitionOrigin, onCovered: () => void) => void;

export const transitionRef: { play: PlayFn | null } = { play: null };
