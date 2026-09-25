import { useEffect, useState } from 'react';

const CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><';

const randomChar = () => CHARS[Math.floor(Math.random() * CHARS.length)];

interface ScrambleTextProps {
  text: string;
  isHovered: boolean;
  className?: string;
}

/** Scramble por hover: no toque do mouse todo o texto vira ruído e se decifra da esquerda pra
 * direita (4 quadros por letra); ao tirar o mouse, volta direto pro texto original, sem animação. */
export default function ScrambleText({ text, isHovered, className }: ScrambleTextProps) {
  const [output, setOutput] = useState(text);

  useEffect(() => {
    if (!isHovered) {
      setOutput(text);
      return;
    }

    let revealed = 0;
    const interval = setInterval(() => {
      revealed += 0.25; // 4 quadros por caractere, a 25ms cada = 100ms/letra
      const count = Math.floor(revealed);

      if (count >= text.length) {
        setOutput(text);
        clearInterval(interval);
        return;
      }

      let next = '';
      for (let i = 0; i < text.length; i++) {
        if (i < count) next += text[i];
        else if (text[i] === ' ') next += ' ';
        else next += randomChar();
      }
      setOutput(next);
    }, 25);

    return () => clearInterval(interval);
  }, [isHovered, text]);

  return <span className={className}>{output}</span>;
}
