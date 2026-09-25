interface BrandMarkProps {
  className?: string;
}

/** A lhama do ARGOS: vídeo curto em loop, usado como logo no cabeçalho e no rodapé. */
export default function BrandMark({ className }: BrandMarkProps) {
  return (
    <video
      src="/assents/video/ollama-logo.mp4"
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
      className={`flex-shrink-0 rounded-full object-cover ${className ?? ''}`}
    />
  );
}
