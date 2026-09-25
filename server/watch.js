import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const serverPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'index.js');

// Vigia o server/index.js e sobe ele de novo sozinho se cair por qualquer motivo (a sessão de
// ferramentas encerrando o processo, queda de energia do terminal, etc.) — sem depender de
// ninguém perceber que ele morreu.
function start() {
  const child = spawn(process.execPath, [serverPath], { stdio: 'inherit' });

  child.on('exit', (code, signal) => {
    if (signal) return; // encerrado de propósito (Ctrl+C, kill) — não reinicia
    console.log(`[ARGOS] Servidor caiu (código ${code}) — reiniciando em 1s...`);
    setTimeout(start, 1000);
  });
}

start();
