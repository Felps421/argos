import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const PORT = process.env.PORT ?? 3001;
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// As 6 categorias são fixas (mesmas do "O que verificamos" no resto do site) — só o
// resultado (ok/warn, nota, achados, score, prompt) varia, gerado pelo Gemini a cada chamada.
const CHECK_LABELS = [
  'Verificando headers de segurança',
  'Procurando chaves e tokens expostos',
  'Testando bancos de dados abertos',
  'Checando arquivos sensíveis (.env, .git)',
  'Avaliando certificado TLS',
  'Comparando versões de tecnologia',
];

const SYSTEM_PROMPT = `Você é o ARGOS, um simulador de varredura de segurança de sites — ainda não existe
motor de varredura real (isso é uma demonstração). Dado o endereço de um site, invente um resultado de
varredura plausível, técnico e VARIADO — nunca repita sempre o mesmo resultado — para estas 6 categorias
fixas, nesta ordem exata:
${CHECK_LABELS.map((l, i) => `${i + 1}. ${l}`).join('\n')}

Responda SOMENTE com um JSON válido, sem markdown, sem comentário, exatamente neste formato:
{
  "score": <número inteiro de 0 a 100 — quanto mais categorias "warn" e mais graves, menor o score>,
  "checks": [
    { "label": "<uma das 6 categorias acima, na mesma ordem>", "outcome": "ok" ou "warn", "note": "<nota técnica curta só quando outcome for warn, senão string vazia>" }
  ],
  "findings": [
    { "title": "<título curto do problema>", "severity": "critical" ou "medium", "desc": "<descrição técnica de 1-2 frases>" }
  ],
  "prompt": "<UM prompt de correção só, cobrindo todos os findings, no formato: frase curta resumindo tudo, linha em branco, 'Corrija:' e uma lista numerada com um passo técnico por finding>"
}

Gere entre 2 e 4 "findings", um pra cada categoria marcada "warn" (se houver mais de 4, escolha as mais
graves). Se nenhuma categoria falhar, "findings" fica vazio e o score deve ficar entre 90 e 100.`;

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/scan', async (req, res) => {
  if (!ai) {
    res.status(500).json({ error: 'GEMINI_API_KEY não configurada no .env do servidor.' });
    return;
  }

  const { hostname } = req.body ?? {};
  if (!hostname) {
    res.status(400).json({ error: 'Envie "hostname".' });
    return;
  }

  console.log(`[ARGOS] /api/scan recebido pra "${hostname}"`);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: `Site: ${hostname}`,
      config: { systemInstruction: SYSTEM_PROMPT },
    });
    console.log(`[ARGOS] Gemini respondeu pra "${hostname}"`);

    const cleaned = response.text.replace(/```(?:json)?/gi, '').trim();
    const data = JSON.parse(cleaned);
    res.json(data);
    console.log(`[ARGOS] Resposta enviada pra "${hostname}"`);
  } catch (error) {
    console.error('[ARGOS] Falha ao gerar varredura:', error);
    res.status(502).json({ error: 'Falha ao chamar a API do Gemini.' });
  }
});

app.listen(PORT, () => {
  console.log(`[ARGOS] Servidor rodando em http://localhost:${PORT}`);
});
