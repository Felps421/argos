import { useEffect, useRef, useState } from 'react';

const CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><';

const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

interface ScrambleInProps {
  text: string;
  /** ms de espera antes de começar a revelar, depois que `triggered` vira true. */
  delay: number;
  triggered: boolean;
}

/** Revelação de entrada: as letras corretas avançam da esquerda pra direita, com um rastro de
 * caracteres aleatórios (até 3 à frente do cursor) simulando o texto "se decifrando". */
export default function ScrambleIn({ text, delay, triggered }: ScrambleInProps) {
  const [output, setOutput] = useState('');
  const revealRef = useRef(0);

  useEffect(() => {
    if (!triggered) {
      setOutput('');
      revealRef.current = 0;
      return;
    }

    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      revealRef.current = 0;
      interval = setInterval(() => {
        revealRef.current += 0.5;
        const revealed = Math.floor(revealRef.current);

        if (revealed >= text.length) {
          setOutput(text);
          if (interval) clearInterval(interval);
          return;
        }

        let next = '';
        for (let i = 0; i < revealed + 3 && i < text.length; i++) {
          if (i < revealed) next += text[i];
          else if (text[i] === ' ') next += ' ';
          else next += randomChar();
        }
        setOutput(next);
      }, 25);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggered, delay, text]);

  if (!triggered) return <>&nbsp;</>;
  return <>{output || ' '}</>;
}
