// Gera os arquivos de identidade visual do site a partir dos originais da
// cliente (marcadagua/ = logo com fundo transparente, 7500×7500 px):
//   assets/img/logo/logo-horizontal-branco.{png,webp}  → header (fundo azul)
//   assets/img/logo/logo-vertical-branco.{png,webp}    → rodapé (fundo azul)
//   icon-192.png, icon-512.png, apple-touch-icon.png, favicon.ico → ícones (RV branco no azul)
//   og-image.jpg (1200×630)                            → compartilhamento
// O recorte é automático (caixa do desenho, sem a margem vazia do arquivo).
// Uso: node scripts/gerar-identidade.mjs   (requer playwright-core e Chrome)
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { chromium } = createRequire(join(raiz, 'package.json'))('playwright-core');
const AZUL = '#1C79C4';

const fonte = async (nome) => `data:image/png;base64,${(await readFile(join(raiz, 'marcadagua', nome))).toString('base64')}`;

const navegador = await chromium.launch({ channel: 'chrome' }).catch(() => chromium.launch());
const pagina = await navegador.newPage();

// Roda no navegador: recorta o desenho e devolve data URLs no tamanho pedido.
async function gerar(origem, tarefas) {
  return pagina.evaluate(async ({ origem, tarefas }) => {
    const img = new Image();
    img.src = origem;
    await img.decode();

    // Caixa do desenho, medida numa cópia reduzida (o original tem 56 milhões de pixels)
    const fator = 8;
    const pw = Math.ceil(img.naturalWidth / fator);
    const ph = Math.ceil(img.naturalHeight / fator);
    const amostra = document.createElement('canvas');
    amostra.width = pw;
    amostra.height = ph;
    const ga = amostra.getContext('2d');
    ga.drawImage(img, 0, 0, pw, ph);
    const dados = ga.getImageData(0, 0, pw, ph).data;
    const linhaTemTinta = (y) => { for (let x = 0; x < pw; x++) if (dados[(y * pw + x) * 4 + 3] > 8) return true; return false; };
    const colunaTemTinta = (x, y0, y1) => { for (let y = y0; y <= y1; y++) if (dados[(y * pw + x) * 4 + 3] > 8) return true; return false; };

    let topo = 0; while (topo < ph && !linhaTemTinta(topo)) topo++;
    let base = ph - 1; while (base > topo && !linhaTemTinta(base)) base--;

    const caixa = (y0, y1) => {
      let esq = 0; while (esq < pw && !colunaTemTinta(esq, y0, y1)) esq++;
      let dir = pw - 1; while (dir > esq && !colunaTemTinta(dir, y0, y1)) dir--;
      // 1 px de folga (na amostra) em cada lado, para não cortar o antisserrilhado
      return {
        x: Math.max(0, (esq - 1) * fator), y: Math.max(0, (y0 - 1) * fator),
        w: Math.min(img.naturalWidth, (dir - esq + 3) * fator), h: Math.min(img.naturalHeight, (y1 - y0 + 3) * fator),
      };
    };

    // Só o monograma: o primeiro bloco de linhas com tinta (antes do vão até "ESPAÇO")
    let fimMonograma = topo; while (fimMonograma < base && linhaTemTinta(fimMonograma + 1)) fimMonograma++;

    const saidas = {};
    for (const t of tarefas) {
      const r = t.monograma ? caixa(topo, fimMonograma) : caixa(topo, base);
      const c = document.createElement('canvas');
      const g = c.getContext('2d');
      g.imageSmoothingQuality = 'high';
      if (t.quadro) {
        // Ícone/OG: fundo de cor sólida e o desenho centralizado
        c.width = t.quadro.w;
        c.height = t.quadro.h;
        g.fillStyle = t.quadro.fundo;
        g.fillRect(0, 0, c.width, c.height);
        const escala = Math.min((c.width * t.quadro.ocupa) / r.w, (c.height * t.quadro.ocupa) / r.h);
        const w = r.w * escala;
        const h = r.h * escala;
        g.drawImage(img, r.x, r.y, r.w, r.h, (c.width - w) / 2, (c.height - h) / 2, w, h);
      } else {
        const escala = t.altura ? t.altura / r.h : t.largura / r.w;
        c.width = Math.round(r.w * escala);
        c.height = Math.round(r.h * escala);
        g.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, c.width, c.height);
      }
      saidas[t.nome] = { url: c.toDataURL(t.tipo, t.qualidade), w: c.width, h: c.height };
    }
    return saidas;
  }, { origem, tarefas });
}

async function salvar(saidas, pasta = '') {
  for (const [nome, { url, w, h }] of Object.entries(saidas)) {
    const buf = Buffer.from(url.split(',')[1], 'base64');
    const destino = join(raiz, pasta, nome);
    await mkdir(dirname(destino), { recursive: true });
    if (nome.endsWith('.ico')) {
      // ICO com um PNG embutido (formato aceito por todos os navegadores atuais)
      const cab = Buffer.alloc(22);
      cab.writeUInt16LE(0, 0); cab.writeUInt16LE(1, 2); cab.writeUInt16LE(1, 4);
      cab.writeUInt8(w, 6); cab.writeUInt8(h, 7); cab.writeUInt16LE(1, 10); cab.writeUInt16LE(32, 12);
      cab.writeUInt32LE(buf.length, 14); cab.writeUInt32LE(22, 18);
      await writeFile(destino, Buffer.concat([cab, buf]));
    } else {
      await writeFile(destino, buf);
    }
    console.log(`${join(pasta, nome)}\t${w}×${h}\t${Math.round(buf.length / 1024)} KB`);
  }
}

// Header: logo horizontal branco, até 52 px de altura na tela → ~2,5× para telas densas
await salvar(await gerar(await fonte('1.png'), [
  { nome: 'logo-horizontal-branco.png', tipo: 'image/png', altura: 132 },
  { nome: 'logo-horizontal-branco.webp', tipo: 'image/webp', qualidade: 0.9, altura: 132 },
]), 'assets/img/logo');

// Rodapé: logo vertical branco, ~220 px de largura na tela → 2×
await salvar(await gerar(await fonte('8.png'), [
  { nome: 'logo-vertical-branco.png', tipo: 'image/png', largura: 440 },
  { nome: 'logo-vertical-branco.webp', tipo: 'image/webp', qualidade: 0.9, largura: 440 },
]), 'assets/img/logo');

// Ícones: monograma RV branco sobre o azul da marca
await salvar(await gerar(await fonte('8.png'), [
  { nome: 'icon-512.png', tipo: 'image/png', monograma: true, quadro: { w: 512, h: 512, fundo: AZUL, ocupa: 0.62 } },
  { nome: 'icon-192.png', tipo: 'image/png', monograma: true, quadro: { w: 192, h: 192, fundo: AZUL, ocupa: 0.62 } },
  { nome: 'apple-touch-icon.png', tipo: 'image/png', monograma: true, quadro: { w: 180, h: 180, fundo: AZUL, ocupa: 0.6 } },
  { nome: 'favicon.ico', tipo: 'image/png', monograma: true, quadro: { w: 32, h: 32, fundo: AZUL, ocupa: 0.78 } },
]));

// Imagem de compartilhamento: logo horizontal branco centralizado no azul
await salvar(await gerar(await fonte('1.png'), [
  { nome: 'og-image.jpg', tipo: 'image/jpeg', qualidade: 0.9, quadro: { w: 1200, h: 630, fundo: AZUL, ocupa: 0.72 } },
]));

await navegador.close();
