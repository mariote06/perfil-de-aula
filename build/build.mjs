// Cria a pasta dist/ com o que vai para o site: o JavaScript das páginas é ofuscado.
// O código legível fica só neste repositório privado.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import JavaScriptObfuscator from 'javascript-obfuscator';

const OUT = 'dist';
const PAGES = ['perfil-de-aula.html', 'aula-ao-vivo.html', 'index.html'];
const COPY = ['sw.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'logo-sala.png', 'logo-parceiro.png'];
const OPTIONS = {
  compact: true,
  simplify: true,
  stringArray: true,
  stringArrayEncoding: ['base64'],
  stringArrayThreshold: 0.75,
  splitStrings: true,
  splitStringsChunkLength: 8,
  identifierNamesGenerator: 'hexadecimal',
  renameGlobals: false,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  selfDefending: false,
  unicodeEscapeSequence: false
};

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT);
for (const page of PAGES) {
  if (!existsSync(page)) continue;
  let html = readFileSync(page, 'utf8');
  let n = 0;
  html = html.replace(/<script>([\s\S]*?)<\/script>/g, (all, code) => {
    n++;
    const out = JavaScriptObfuscator.obfuscate(code, OPTIONS).getObfuscatedCode();
    return '<script>' + out.replace(/<\/script/gi, '<\\/script') + '</script>';
  });
  writeFileSync(`${OUT}/${page}`, html);
  console.log(`${page}: ${n} script(s) ofuscado(s)`);
}
for (const f of COPY) if (existsSync(f)) copyFileSync(f, `${OUT}/${f}`);
