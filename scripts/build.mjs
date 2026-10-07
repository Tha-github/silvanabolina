import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = resolve(projectRoot, 'dist');
const cssSources = [
  'assets/css/tokens.css',
  'assets/css/base.css',
  'assets/css/components.css',
  'assets/css/sections.css',
];
const htmlPages = ['index.html', 'politica-de-privacidade.html', '404.html'];

await rm(outputRoot, { recursive: true, force: true });
await mkdir(resolve(outputRoot, 'assets/dist'), { recursive: true });
await mkdir(resolve(outputRoot, 'assets/css'), { recursive: true });

const css = (await Promise.all(cssSources.map((path) => readFile(resolve(projectRoot, path), 'utf8')))).join('\n');
const minifiedCss = await transform(css, {
  loader: 'css',
  minify: true,
  target: ['es2020'],
  legalComments: 'none',
});
const js = await readFile(resolve(projectRoot, 'assets/js/main.js'), 'utf8');
const minifiedJs = await transform(js, {
  loader: 'js',
  minify: true,
  target: 'es2020',
  format: 'iife',
  legalComments: 'none',
});

await writeFile(resolve(outputRoot, 'assets/dist/site.min.css'), minifiedCss.code);
await writeFile(resolve(outputRoot, 'assets/dist/main.min.js'), minifiedJs.code);
await cp(resolve(projectRoot, 'assets/css/no-js.css'), resolve(outputRoot, 'assets/css/no-js.css'), { recursive: true });
await cp(resolve(projectRoot, 'assets/img'), resolve(outputRoot, 'assets/img'), { recursive: true });
await cp(resolve(projectRoot, 'assets/fonts'), resolve(outputRoot, 'assets/fonts'), { recursive: true });
await cp(resolve(projectRoot, 'favicon.svg'), resolve(outputRoot, 'favicon.svg'));
for (const file of ['favicon.ico', 'apple-touch-icon.png', 'og-image.jpg', 'robots.txt', 'sitemap.xml', 'site.webmanifest', '.htaccess', '_headers', 'vercel.json']) {
  await cp(resolve(projectRoot, file), resolve(outputRoot, file));
}
await cp(resolve(projectRoot, '.well-known'), resolve(outputRoot, '.well-known'), { recursive: true });

for (const page of htmlPages) {
  const sourcePath = resolve(projectRoot, page);
  let html = await readFile(sourcePath, 'utf8');
  const stylePattern = /  <link rel="stylesheet" href="assets\/css\/(?:tokens|base|components|sections)\.css">\r?\n/g;
  const removedStyles = html.match(stylePattern) || [];
  if (removedStyles.length !== 4) {
    throw new Error(`Esperava quatro folhas CSS de origem em ${page}; encontrei ${removedStyles.length}.`);
  }
  html = html.replace(stylePattern, '').replace('  <noscript>', '  <link rel="stylesheet" href="assets/dist/site.min.css">\n  <noscript>');
  html = html.replace('assets/js/main.js', 'assets/dist/main.min.js');
  await writeFile(resolve(outputRoot, page), html);
}

console.log('Build pronto em dist/. Publique o conteúdo dessa pasta.');
