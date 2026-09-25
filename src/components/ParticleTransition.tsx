import { useEffect, useRef, useState } from 'react';
import { particleTransitionRef } from '../lib/particleTransition';

// Adaptado do componente "ParticleTextEffect" que o Felipe mandou (canvas + partículas com
// steering behavior, arara.dev/21st.dev). Trocado de widget de demonstração (várias palavras
// ciclando, canvas pequeno, interação de mouse) pra transição de página em tela cheia:
// as partículas voam de fora da tela e formam "ARGOS" em vermelho, seguram um instante,
// e voam de volta pra fora enquanto esmaecem pro preto — é nesse "segurando" que a navegação
// de verdade acontece por trás, escondida.

interface Vector2D {
  x: number;
  y: number;
}
interface RGB {
  r: number;
  g: number;
  b: number;
}

const ARGOS_RED: RGB = { r: 255, g: 43, b: 31 }; // mesmo vermelho-sinal do resto do site
const BLACK: RGB = { r: 0, g: 0, b: 0 };

function blend(a: RGB, b: RGB, w: number): RGB {
  return { r: a.r + (b.r - a.r) * w, g: a.g + (b.g - a.g) * w, b: a.b + (b.b - a.b) * w };
}

function randomOffscreenPos(cx: number, cy: number, mag: number): Vector2D {
  const rx = Math.random() * window.innerWidth;
  const ry = Math.random() * window.innerHeight;
  const dir = { x: rx - cx, y: ry - cy };
  const m = Math.sqrt(dir.x * dir.x + dir.y * dir.y) || 1;
  return { x: cx + (dir.x / m) * mag, y: cy + (dir.y / m) * mag };
}

class Particle {
  pos: Vector2D = { x: 0, y: 0 };
  vel: Vector2D = { x: 0, y: 0 };
  acc: Vector2D = { x: 0, y: 0 };
  target: Vector2D = { x: 0, y: 0 };
  closeEnoughTarget = 80;
  maxSpeed = 6;
  maxForce = 0.35;
  particleSize = 3;
  isKilled = false;
  startColor: RGB = BLACK;
  targetColor: RGB = BLACK;
  colorWeight = 0;
  colorBlendRate = 0.03;

  move() {
    const dx = this.pos.x - this.target.x;
    const dy = this.pos.y - this.target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const proximityMult = distance < this.closeEnoughTarget ? distance / this.closeEnoughTarget : 1;

    const towards = { x: this.target.x - this.pos.x, y: this.target.y - this.pos.y };
    const mag = Math.sqrt(towards.x ** 2 + towards.y ** 2);
    if (mag > 0) {
      towards.x = (towards.x / mag) * this.maxSpeed * proximityMult;
      towards.y = (towards.y / mag) * this.maxSpeed * proximityMult;
    }

    const steer = { x: towards.x - this.vel.x, y: towards.y - this.vel.y };
    const steerMag = Math.sqrt(steer.x ** 2 + steer.y ** 2);
    if (steerMag > 0) {
      steer.x = (steer.x / steerMag) * this.maxForce;
      steer.y = (steer.y / steerMag) * this.maxForce;
    }

    this.acc.x += steer.x;
    this.acc.y += steer.y;
    this.vel.x += this.acc.x;
    this.vel.y += this.acc.y;
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
    this.acc.x = 0;
    this.acc.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.colorWeight < 1) this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1);
    const c = blend(this.startColor, this.targetColor, this.colorWeight);
    ctx.fillStyle = `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;
    ctx.fillRect(this.pos.x, this.pos.y, this.particleSize, this.particleSize);
  }

  /** Manda a partícula de volta pra fora da tela, esmaecendo pro preto — o "movimento ao contrário". */
  kill(width: number, height: number) {
    if (this.isKilled) return;
    this.target = randomOffscreenPos(width / 2, height / 2, (width + height) / 2);
    this.startColor = blend(this.startColor, this.targetColor, this.colorWeight);
    this.targetColor = BLACK;
    this.colorWeight = 0;
    this.isKilled = true;
  }
}

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ParticleTransition() {
  const [visible, setVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | undefined>(undefined);
  const timersRef = useRef<number[]>([]);

  const formWord = (word: string) => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0) return;

    const off = document.createElement('canvas');
    off.width = canvas.width;
    off.height = canvas.height;
    const octx = off.getContext('2d')!;
    const fontSize = Math.min(canvas.width / (word.length * 0.62), canvas.height * 0.32);
    octx.fillStyle = 'white';
    octx.font = `bold ${fontSize}px Arial, sans-serif`;
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillText(word, canvas.width / 2, canvas.height / 2);

    const { data } = octx.getImageData(0, 0, canvas.width, canvas.height);
    const particles = particlesRef.current;

    // Amostragem: controla quantos pixels do texto viram partícula. Maior em telas grandes,
    // pra não gerar dezenas de milhares de partículas (custa caro no canvas 2D).
    const step = window.innerWidth < 640 ? 7 : 11;
    const coords: number[] = [];
    for (let i = 0; i < data.length; i += step * 4) coords.push(i);
    for (let i = coords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [coords[i], coords[j]] = [coords[j], coords[i]];
    }

    let idx = 0;
    for (const c of coords) {
      if (data[c + 3] <= 0) continue;
      const x = (c / 4) % canvas.width;
      const y = Math.floor(c / 4 / canvas.width);

      let p: Particle;
      if (idx < particles.length) {
        p = particles[idx];
        p.isKilled = false;
        idx++;
      } else {
        p = new Particle();
        p.pos = randomOffscreenPos(canvas.width / 2, canvas.height / 2, (canvas.width + canvas.height) / 2);
        p.maxSpeed = Math.random() * 5 + 6;
        p.maxForce = p.maxSpeed * 0.06;
        p.particleSize = Math.random() * 2 + 2;
        p.colorBlendRate = Math.random() * 0.03 + 0.02;
        particles.push(p);
      }
      p.startColor = blend(p.startColor, p.targetColor, p.colorWeight);
      p.targetColor = ARGOS_RED;
      p.colorWeight = 0;
      p.target = { x, y };
    }
    for (let i = idx; i < particles.length; i++) particles[i].kill(canvas.width, canvas.height);
  };

  const killAll = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    for (const p of particlesRef.current) p.kill(canvas.width, canvas.height);
  };

  // Expõe o disparo pro resto do app (ScanForm, Architecture, Navbar) via o módulo-ref.
  useEffect(() => {
    particleTransitionRef.play = (onCovered) => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];

      if (reduceMotion()) {
        // Mais suave, não zero: sem o efeito de partículas, só um instante coberto.
        setVisible(true);
        timersRef.current.push(window.setTimeout(onCovered, 200));
        timersRef.current.push(window.setTimeout(() => setVisible(false), 550));
        return;
      }

      setVisible(true);
      // Espera o <canvas> montar e ganhar tamanho (próximo frame) antes de formar o texto.
      requestAnimationFrame(() => requestAnimationFrame(() => formWord('ARGOS')));

      // Segura o "ARGOS" já montado na tela por um instante antes de desmanchar — o Felipe
      // pediu mais 2-3s aqui, porque antes ele começava a se formar e já sumia em seguida.
      timersRef.current.push(
        window.setTimeout(() => {
          onCovered(); // a navegação de verdade acontece aqui, escondida atrás das partículas
          killAll();
          timersRef.current.push(window.setTimeout(() => setVisible(false), 1500));
        }, 4000),
      );
    };

    return () => {
      particleTransitionRef.play = null;
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  // Loop de desenho: só existe enquanto a transição está visível.
  useEffect(() => {
    if (!visible || reduceMotion()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      // Rastro leve (motion blur) em vez de limpar o quadro inteiro — dá peso ao movimento.
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.move();
        p.draw(ctx);
        if (p.isKilled && (p.pos.x < -60 || p.pos.x > canvas.width + 60 || p.pos.y < -60 || p.pos.y > canvas.height + 60)) {
          particles.splice(i, 1);
        }
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      particlesRef.current = [];
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[150] bg-black" aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
