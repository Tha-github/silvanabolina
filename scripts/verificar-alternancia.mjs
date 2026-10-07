// Verifica a alternância de fundos branco/azul do index.html (prompt.md, seção 7.1).
// Lista, na ordem, cada <section> e o <footer> com id, classe e background-color
// calculado pelo navegador. Vizinhas com o mesmo fundo, seções aninhadas ou
// seção sem .secao--clara/.secao--escura contam como erro (código de saída 1).
//
// Uso: node scripts/verificar-alternancia.mjs [pasta]   (padrão: raiz do projeto)
// Requer playwright-core (npm i -D playwright-core) e o Chrome instalado.
// Sem playwright-core, cai numa leitura estática do HTML + tokens do CSS.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..', process.argv[2] || '.');
const tipos = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.ico': 'image/x-icon', '.jpg': 'image/jpeg', '.webmanifest': 'application/manifest+json' };

function imprimir(linhas) {
  const cab = ['#', 'elemento', 'id', 'classe de fundo', 'background-color', 'situação'];
  const dados = linhas.map((l, i) => [String(i + 1), l.tag, l.id || '—', l.classe || '—', l.cor, l.situacao]);
  const larg = cab.map((c, i) => Math.max(c.length, ...dados.map((d) => d[i].length)));
  const fmt = (cols) => `| ${cols.map((c, i) => c.padEnd(larg[i])).join(' | ')} |`;
  console.log(fmt(cab));
  console.log(`|${larg.map((n) => '-'.repeat(n + 2)).join('|')}|`);
  dados.forEach((d) => console.log(fmt(d)));
}

function avaliar(linhas) {
  let erros = 0;
  let anterior = null;
  for (const l of linhas) {
    if (l.hidden) { l.situacao = 'oculta (fora da conta)'; continue; }
    if (l.divisor) { l.situacao = 'divisória (fora da conta)'; continue; }
    const problemas = [];
    if (l.aninhada) problemas.push('ERRO: aninhada em outra seção');
    if (l.tag === 'section' && !/secao--(clara|escura)/.test(l.classe)) problemas.push('ERRO: sem .secao--clara/.secao--escura');
    if (anterior && anterior.cor.split(' (')[0] === l.cor.split(' (')[0]) problemas.push(`ERRO: mesmo fundo que #${anterior.id || anterior.tag}`);
    if (l.wrapperComFundo) problemas.push(`ERRO: wrapper interno com fundo (${l.wrapperComFundo})`);
    l.situacao = problemas.length ? problemas.join('; ') : 'ok';
    erros += problemas.length;
    anterior = l;
  }
  return erros;
}

async function viaNavegador() {
  const { chromium } = await import('playwright-core');
  const servidor = createServer(async (req, res) => {
    try {
      let caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (caminho.endsWith('/')) caminho += 'index.html';
      const arquivo = normalize(join(raiz, caminho));
      if (!arquivo.startsWith(raiz)) throw new Error('fora da raiz');
      const corpo = await readFile(arquivo);
      res.writeHead(200, { 'content-type': tipos[extname(arquivo)] || 'application/octet-stream' });
      res.end(corpo);
    } catch {
      res.writeHead(404); res.end();
    }
  });
  await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
  const porta = servidor.address().port;
  const navegador = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
  try {
    const pagina = await navegador.newPage({ viewport: { width: 1280, height: 900 } });
    await pagina.goto(`http://127.0.0.1:${porta}/index.html`, { waitUntil: 'networkidle' });
    return await pagina.evaluate(() => {
      const alvos = [...document.querySelectorAll('section, body > footer, .marquee')];
      return alvos.map((el) => {
        const estilo = getComputedStyle(el);
        // Fundo transparente herda visualmente o do ancestral mais próximo com cor.
        let corEfetiva = estilo.backgroundColor;
        for (let p = el.parentElement; p && corEfetiva === 'rgba(0, 0, 0, 0)'; p = p.parentElement) corEfetiva = getComputedStyle(p).backgroundColor;
        const largura = el.getBoundingClientRect().width;
        // Algum descendente ocupa a largura toda da seção com fundo próprio?
        const wrapper = [...el.querySelectorAll('*')].find((filho) => {
          const r = filho.getBoundingClientRect();
          const bg = getComputedStyle(filho).backgroundColor;
          return r.width >= largura - 1 && r.height > 200 && bg !== 'rgba(0, 0, 0, 0)' && bg !== estilo.backgroundColor;
        });
        return {
          tag: el.tagName.toLowerCase(),
          id: el.id,
          classe: [...el.classList].filter((c) => c.startsWith('secao--') || c === 'marquee' || c === 'site-footer').join(' '),
          cor: el.classList.contains('marquee') ? `${estilo.backgroundImage.slice(0, 40)}…` : (corEfetiva === estilo.backgroundColor ? corEfetiva : `${corEfetiva} (herdado)`),
          hidden: el.hidden,
          divisor: el.classList.contains('marquee'),
          aninhada: el.tagName === 'SECTION' && Boolean(el.parentElement.closest('section')),
          wrapperComFundo: wrapper ? `${wrapper.tagName.toLowerCase()}.${[...wrapper.classList].join('.')}` : '',
        };
      });
    });
  } finally {
    await navegador.close();
    servidor.close();
  }
}

async function viaLeituraEstatica() {
  const html = await readFile(join(raiz, 'index.html'), 'utf8');
  const tokens = await readFile(join(raiz, 'assets/css/tokens.css'), 'utf8');
  const valor = (nome) => (tokens.match(new RegExp(`--${nome}:\\s*([^;]+);`)) || [])[1];
  const cores = { 'secao--clara': valor('branco'), 'secao--escura': valor('azul') };
  const tags = [...html.matchAll(/<(section|footer|div)\b([^>]*)>/g)].filter(([, tag, attrs]) => tag !== 'div' || /class="marquee"/.test(attrs));
  return tags.map(([, tag, attrs]) => {
    const classe = (attrs.match(/class="([^"]*)"/) || [])[1] || '';
    const fundo = classe.split(/\s+/).find((c) => cores[c]);
    return {
      tag,
      id: (attrs.match(/id="([^"]*)"/) || [])[1] || '',
      classe: classe.split(/\s+/).filter((c) => c.startsWith('secao--') || c === 'marquee' || c === 'site-footer').join(' '),
      cor: tag === 'footer' ? `${valor('azul')} (rodapé)` : fundo ? cores[fundo] : (classe === 'marquee' ? 'gradiente' : '?'),
      hidden: /\shidden(\s|$|>)/.test(attrs),
      divisor: classe === 'marquee',
      aninhada: false,
      wrapperComFundo: '',
    };
  });
}

let linhas;
try {
  linhas = await viaNavegador();
  console.log('Fonte: estilos calculados pelo Chrome (Playwright).\n');
} catch (erro) {
  console.log(`Playwright indisponível (${erro.message.split('\n')[0]}). Usando leitura estática do HTML/CSS.\n`);
  linhas = await viaLeituraEstatica();
}
const erros = avaliar(linhas);
imprimir(linhas);
console.log(erros ? `\n${erros} erro(s) de alternância.` : '\nAlternância correta.');
process.exitCode = erros ? 1 : 0;
