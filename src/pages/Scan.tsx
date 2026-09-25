import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LiquidMetalButton } from '../components/ui/liquid-metal-button';
import SiteFooter from '../components/SiteFooter';
import ScanForm from '../components/ScanForm';
import { particleTransitionRef } from '../lib/particleTransition';
import { scrollToY } from '../lib/lenis';

// --- Resultado da varredura ---------------------------------------------------------------
// Ainda não existe motor de varredura de verdade (isso é fase 2 do projeto). Em vez de dados
// fixos, quem gera o resultado inteiro (score, checagens, achados e o prompt de correção) é o
// Gemini (server/index.js) — cada varredura sai diferente, mesmo sendo tudo fictício.
interface CheckResult {
  label: string;
  outcome: 'ok' | 'warn';
  note?: string;
}

interface Finding {
  title: string;
  severity: 'critical' | 'medium';
  desc: string;
}

interface ScanResult {
  score: number;
  checks: CheckResult[];
  findings: Finding[];
  prompt: string;
}

// Só usado como placeholder visual enquanto o Gemini ainda não respondeu (tudo "pendente").
const CHECK_LABELS_PLACEHOLDER = [
  'Verificando headers de segurança',
  'Procurando chaves e tokens expostos',
  'Testando bancos de dados abertos',
  'Checando arquivos sensíveis (.env, .git)',
  'Avaliando certificado TLS',
  'Comparando versões de tecnologia',
];

// URL do backend (server/index.js) — em produção, troca só essa variável de ambiente.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

function scoreColor(score: number, phase: 'idle' | 'scanning' | 'done') {
  if (phase !== 'done') return 'text-white/50';
  if (score < 50) return 'text-red-500';
  if (score < 80) return 'text-amber-400';
  return 'text-emerald-400';
}

function FindingCard({ finding }: { finding: Finding }) {
  const isCritical = finding.severity === 'critical';

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-[16px] font-medium text-white sm:text-[18px]">{finding.title}</h3>
        <span
          className={`flex-shrink-0 rounded-full px-3 py-1 text-[11px] uppercase tracking-wide ${
            isCritical ? 'bg-red-500/15 text-red-400' : 'bg-amber-400/15 text-amber-300'
          }`}
        >
          {isCritical ? 'Crítico' : 'Médio'}
        </span>
      </div>
      <p className="text-[13px] leading-relaxed text-white/50 sm:text-[14px]">{finding.desc}</p>
    </div>
  );
}

function CorrectionPrompt({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // sem permissão de clipboard — segue sem travar, o texto continua selecionável no <pre>
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mt-10 rounded-lg border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <p className="mb-4 text-[13px] uppercase tracking-[0.2em] text-white/40">Prompt de correção</p>
      <pre className="whitespace-pre-wrap rounded-md border border-white/10 bg-black/40 p-4 font-mono text-[12px] leading-relaxed text-white/70">
        {prompt}
      </pre>
      <button
        type="button"
        onClick={copy}
        className="mt-3 rounded-full border border-white/20 px-3 py-1.5 text-[11px] text-white/70 transition-colors duration-200 hover:border-white/40 hover:text-white"
      >
        {copied ? 'Copiado!' : 'Copiar prompt'}
      </button>
    </div>
  );
}

export default function Scan() {
  const location = useLocation();
  const navigate = useNavigate();
  // Só chega com URL vinda do Hero (campo do topo) — o botão sem link, no fim da primeira
  // página, navega pra /scan sem state nenhum, então cai direto na tela de "digite o endereço",
  // sem rodar a varredura fictícia sozinho.
  const stateUrl = (location.state as { url?: string } | null)?.url;

  const [targetUrl, setTargetUrl] = useState(stateUrl ?? 'https://seusite.com.br');
  const hostname = (() => {
    try {
      return new URL(targetUrl).hostname;
    } catch {
      return targetUrl.replace(/^https?:\/\//, '');
    }
  })();

  const [resolvedCount, setResolvedCount] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'done'>(stateUrl ? 'scanning' : 'idle');
  const [displayValue, setDisplayValue] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState(false);
  const displayRef = useRef(0);
  const reportRef = useRef<HTMLDivElement>(null);

  // Pede pro Gemini gerar a varredura inteira (score, checagens, achados e prompt) pro
  // endereço novo, sem sair da rota /scan. A animação de "resolvendo checagem por checagem"
  // só começa a andar depois que esse resultado chega (ver o efeito logo abaixo).
  const startScan = async (url: string) => {
    setTargetUrl(url);
    setResolvedCount(0);
    displayRef.current = 0;
    setDisplayValue(0);
    setScanResult(null);
    setScanError(false);
    setPhase('scanning');

    try {
      const scanHostname = (() => {
        try {
          return new URL(url).hostname;
        } catch {
          return url.replace(/^https?:\/\//, '');
        }
      })();
      // Limite de 30s — sem isso, se o Gemini nunca responder, a tela fica presa em
      // "conectando" pra sempre, sem nenhum jeito de sair (o botão "Testar outro site" só
      // aparece depois que o relatório carrega).
      const res = await fetch(`${API_URL}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostname: scanHostname }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) throw new Error('Falha na varredura.');
      const data: ScanResult = await res.json();
      setScanResult(data);
    } catch {
      setScanError(true);
    }
  };

  // Quem chega com URL do Hero (state da navegação) precisa de fato disparar a chamada ao
  // Gemini na montagem — sem isso, o "phase" já nasce 'scanning' mas "scanResult" nunca
  // chega, e a barra fica travada em 0% pra sempre. O ref evita disparar duas vezes por causa
  // do StrictMode do React (que roda todo efeito de montagem duas vezes em desenvolvimento) —
  // sem ele, cada varredura vinda do Hero gastaria duas chamadas ao Gemini à toa.
  const startedFromHeroRef = useRef(false);
  useEffect(() => {
    if (stateUrl && !startedFromHeroRef.current) {
      startedFromHeroRef.current = true;
      startScan(stateUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "Testar outro site" não sai mais pra Home — volta pro topo da própria página de scan e
  // troca o cabeçalho por um campo pra digitar o novo endereço (ver JSX abaixo, phase === 'idle').
  const handleTestAnother = () => {
    setPhase('idle');
    scrollToY(0);
  };

  // "Ver planos" segue pra terceira página, com a mesma transição de partículas do resto do site.
  const goToPlanos = () => {
    const go = () => navigate('/planos');
    if (particleTransitionRef.play) particleTransitionRef.play(go);
    else go();
  };

  // Resolve uma checagem por vez, ~1,5s cada; quando a última termina, libera o relatório.
  // Fica parado enquanto phase === 'idle' (esperando endereço) ou enquanto o Gemini ainda não
  // respondeu (scanResult null) — não tem o que "resolver" antes do resultado chegar.
  useEffect(() => {
    if (phase !== 'scanning' || !scanResult) return;
    if (resolvedCount >= scanResult.checks.length) {
      const t = setTimeout(() => setPhase('done'), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setResolvedCount((c) => c + 1), 1500);
    return () => clearTimeout(t);
  }, [resolvedCount, phase, scanResult]);

  // O número sobe suavemente até o alvo atual: enquanto varre, o alvo é o progresso real
  // (0→100%, um degrau por checagem resolvida, tipo um carregamento de verdade); quando
  // termina, o alvo vira a nota final que o Gemini deu — mesma curva do contador da Home.
  useEffect(() => {
    const totalChecks = scanResult?.checks.length ?? CHECK_LABELS_PLACEHOLDER.length;
    const target = phase === 'done' && scanResult ? scanResult.score : (resolvedCount / totalChecks) * 100;
    const from = displayRef.current;
    const start = performance.now();
    const duration = 700;
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - t) ** 3;
      const value = from + (target - from) * eased;
      displayRef.current = value;
      setDisplayValue(Math.round(value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, resolvedCount, scanResult]);

  // Quando o relatório aparece, rola suavemente até ele.
  useEffect(() => {
    if (phase !== 'done') return;
    const t = setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 500);
    return () => clearTimeout(t);
  }, [phase]);

  const displayChecks: CheckResult[] =
    scanResult?.checks ?? CHECK_LABELS_PLACEHOLDER.map((label) => ({ label, outcome: 'ok' as const }));

  return (
    <main className="min-h-screen bg-black px-6 pb-32 pt-32 sm:px-10">
      {phase === 'idle' ? (
        <div className="mx-auto max-w-md text-center">
          <p className="mb-2 text-[13px] uppercase tracking-[0.2em] text-white/40">Nova varredura</p>
          <h1 className="mb-8 font-mono text-[18px] text-white sm:text-[24px]">&gt; digite o endereço do site</h1>
          <div className="mx-auto flex justify-center">
            <ScanForm onSubmit={startScan} />
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-2 text-[13px] uppercase tracking-[0.2em] text-white/40">
            {phase === 'scanning' ? 'Varredura em andamento' : 'Varredura concluída'}
          </p>
          <h1 className="caret font-mono text-[18px] text-white sm:text-[24px]">&gt; escaneando {hostname}</h1>

          {/* lhama + linha de scan vermelha (a mesma varredura em CSS que aparece no resto do site) */}
          <div className="scan-sweep relative mx-auto my-10 h-40 w-40 overflow-hidden rounded-full sm:h-52 sm:w-52">
            <video src="/assents/video/ollama-logo.mp4" autoPlay muted loop playsInline className="h-full w-full object-cover" />
          </div>

          {scanError ? (
            <div className="mx-auto max-w-md">
              <p className="text-[14px] text-red-400">
                Não deu pra conectar com o servidor local — confira se ele está rodando (<code>npm run server</code>{' '}
                dentro de <code>web/</code>).
              </p>
              <button
                type="button"
                onClick={() => startScan(targetUrl)}
                className="mt-4 rounded-full border border-white/20 px-6 py-3 text-[13px] text-white/80 transition-colors duration-200 hover:border-white/50 hover:text-white"
              >
                Tentar de novo
              </button>
            </div>
          ) : (
            <>
              <div className="mb-12">
                <div
                  className={`text-[clamp(56px,12vw,120px)] font-light leading-none tracking-[-0.03em] tabular-nums transition-colors duration-500 ${scoreColor(displayValue, phase)}`}
                >
                  {displayValue}
                  {phase === 'scanning' && <span className="text-[0.35em] align-top">%</span>}
                </div>
                <p className="mt-2 text-[13px] uppercase tracking-[0.15em] text-white/40">
                  {phase === 'done' ? 'de 100' : !scanResult ? 'conectando com o gemini...' : 'calculando'}
                </p>
                <div className="mx-auto mt-5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-red-500 transition-[width] duration-700 ease-out"
                    style={{ width: `${Math.min(Math.max(displayValue, 0), 100)}%` }}
                  />
                </div>
              </div>

              <div className="mx-auto max-w-lg space-y-3 text-left font-mono text-[13px] sm:text-[14px]">
                {displayChecks.map((check, i) => {
                  const state = i < resolvedCount ? 'done' : i === resolvedCount ? 'running' : 'pending';
                  return (
                    <div
                      key={check.label}
                      className={`flex items-center justify-between gap-3 transition-opacity duration-300 ${state === 'pending' ? 'opacity-30' : 'opacity-100'}`}
                    >
                      <span className="text-white/70">
                        &gt; {check.label}
                        {state === 'running' ? '...' : ''}
                      </span>
                      {state === 'done' && (
                        <span className={`flex-shrink-0 ${check.outcome === 'ok' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {check.outcome === 'ok' ? '✓' : `⚠ ${check.note}`}
                        </span>
                      )}
                      {state === 'running' && <span className="flex-shrink-0 animate-pulse text-white/40">rodando</span>}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {phase === 'done' && scanResult && (
        <div ref={reportRef} className="mx-auto mt-24 max-w-6xl scroll-mt-24">
          <p className="mb-3 text-[13px] uppercase tracking-[0.2em] text-white/40">Relatório</p>
          <h2 className="mb-4 text-[clamp(28px,5vw,44px)] font-light leading-tight text-white">
            {scanResult.findings.length} pontos pra corrigir em {hostname}
          </h2>
          <p className="mb-12 max-w-xl text-[14px] leading-relaxed text-white/45 sm:text-[15px]">
            Achados de demonstração — assim que o motor de varredura de verdade entrar, esse
            relatório passa a mostrar o que foi encontrado no seu site de fato.
          </p>

          {/* A lhama aponta pros achados — alinhada com os cards (não com o título acima), à
              direita, apontando pra esquerda (onde a lista está). */}
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-16">
            <div className="order-2 w-full lg:order-1 lg:flex-1">
              <div className="space-y-4">
                {scanResult.findings.map((finding) => (
                  <FindingCard key={finding.title} finding={finding} />
                ))}
              </div>
            </div>

            <div className="order-1 w-full max-w-[320px] flex-shrink-0 lg:order-2 lg:mt-24 lg:max-w-[620px] lg:sticky lg:top-28">
              <video
                src="/assents/video/llama-pag2.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="mx-auto w-full"
              />
            </div>
          </div>

          <CorrectionPrompt prompt={scanResult.prompt} />

          <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <LiquidMetalButton label="Ver planos" onClick={goToPlanos} />
            <button
              type="button"
              onClick={handleTestAnother}
              className="rounded-full border border-white/20 px-6 py-3 text-[13px] text-white/70 transition-colors duration-200 hover:border-white/40 hover:text-white"
            >
              Testar outro site
            </button>
          </div>
        </div>
      )}

      <SiteFooter />
    </main>
  );
}
