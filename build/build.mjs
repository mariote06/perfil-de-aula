// Cria as pastas que vão para o site: o JavaScript das páginas é ofuscado.
// O código legível fica só neste repositório.
//   dist/        -> perfil-de-aula.web.app  (endereço antigo, continua a funcionar)
//   dist-coach/  -> playride-coach.web.app  (professores: a página inicial é a app do professor)
//   dist-aluno/  -> playride.web.app        (alunos: a página inicial é a app do aluno)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import JavaScriptObfuscator from 'javascript-obfuscator';

const PAGES = ['perfil-de-aula.html', 'aula-ao-vivo.html', 'index.html'];
const COPY = ['sw.js', 'manifest.json', 'manifest-prof.json', 'icon-192.png', 'icon-512.png', 'icon-prof-192.png', 'icon-prof-512.png', 'instalar.js', 'logo-sala.png', 'logo-parceiro.png'];
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

const built = {};
for (const page of PAGES) {
  if (!existsSync(page)) continue;
  let html = readFileSync(page, 'utf8');
  let n = 0;
  html = html.replace(/<script>([\s\S]*?)<\/script>/g, (all, code) => {
    n++;
    const out = JavaScriptObfuscator.obfuscate(code, OPTIONS).getObfuscatedCode();
    return '<script>' + out.replace(/<\/script/gi, '<\\/script') + '</script>';
  });
  built[page] = html;
  console.log(`${page}: ${n} script(s) ofuscado(s)`);
}

function site(dir, home, manifest) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir);
  for (const [page, html] of Object.entries(built)) writeFileSync(`${dir}/${page}`, html);
  for (const f of COPY) if (existsSync(f)) copyFileSync(f, `${dir}/${f}`);
  if (home) {
    writeFileSync(`${dir}/index.html`, built[home]);
    const m = JSON.parse(readFileSync(manifest, 'utf8'));
    m.id = './'; m.start_url = './';
    writeFileSync(`${dir}/${manifest}`, JSON.stringify(m, null, 2));
  }
  console.log(`${dir}: pronto`);
}

site('dist', null, null);
site('dist-coach', 'perfil-de-aula.html', 'manifest-prof.json');
site('dist-aluno', 'aula-ao-vivo.html', 'manifest.json');
