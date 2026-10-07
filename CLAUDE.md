# CLAUDE.md — Espaço Revolução de Vidas (Silvana Bolina, psicóloga)

A especificação oficial é o `prompt.md`. **Leia-o antes de qualquer tarefa.** Este arquivo resume só as regras permanentes.

## Stack
- HTML5 semântico + CSS3 + JavaScript puro (vanilla). **Sem frameworks, sem build, sem CDN, sem dependências em produção.**
- CSS separado em `assets/css/`: `tokens.css` (variáveis) → `base.css` (reset, fontes, tipografia, utilitários) → `components.css` (header, botões, marquee…) → `sections.css` (layout de cada seção). `no-js.css` só entra via `<noscript>` (menu aberto sem JS).
- JS em um único arquivo: `assets/js/main.js`, script clássico com `defer` (sem `type="module"`, para funcionar também abrindo o HTML direto via file://; o build empacota em IIFE). Dados configuráveis ficam no objeto `SITE_CONFIG` no topo dele.
- Fontes auto-hospedadas em `assets/fonts/` (woff2, `font-display: swap`). Texto: Garet (versão gratuita da Type Forward/Spacetype, só o Book 400 é usado (Heavy removido por leveza); EULA em `assets/fonts/EULA-Garet-Spacetype.pdf`). Títulos: Typhone (Typia Nesia, paga) — `TODO-CLIENTE: licença`; até lá Lora é o fallback em `--fonte-titulo`. Nunca usar arquivo "demo"/pessoal de fonte paga.
- Mobile-first. Breakpoints: 30em (480px), 48em (768px), 64em (1024px), 80em (1280px). O menu horizontal só entra a partir de 80em (abaixo disso, hambúrguer); `DESKTOP` no `main.js` e `no-js.css` usam o mesmo valor. Conteúdo com no máximo 1200px. Alvos de toque com pelo menos 44px.

## Direção visual (seções 7 e 8 do prompt.md — rodada de ajustes de 07/10/2026)
- Paleta (troca de 07/10/2026: todo o azul passou a ser #324089): --azul #324089 (fundos azuis, textos, contornos; 9,42:1 com branco), --azul-card #26316D (tom mais fundo do mesmo azul, só para cartões sobre seções azuis), --azul-profundo #11163A (SÓ texto/ícone sobre o ouro: botões, faixa, flutuante, seleção — o #324089 daria 2,65:1 ali), --branco #FFFFFF e ouro metálico: --ouro-gradiente (135°, #BF953F → #FCF6BA → #B38728 → #FBF5B7 → #B07F24), --ouro-gradiente-suave (mesmas paradas a 180°, fios verticais) e --ouro-fallback #B38728 (forced-colors, sem suporte, bordas de campo e checks). Os dourados lisos antigos (--dourado #C9A24B, --dourado-texto #8A6A1F) foram removidos — não reintroduzir. Nada de verde.
- Ouro em: botões primários/WhatsApp/flutuante (gradiente, texto --azul-profundo, hover move background-position); faixa marquee (gradiente, texto --azul-profundo); linhas, bordas e contorno da foto (duplo background padding-box/border-box ou pseudo-elemento com mask).
- Texto dourado (background-clip: text, classe .texto-ouro) SOMENTE sobre azul. Texto dourado sobre o azul usa --ouro-gradiente-sobre-azul (#E2C270 → #FCF6BA → #DCB960 → #FBF5B7, todas >= 5:1; fallback --ouro-claro-fallback #DCB960), nunca o ouro metálico (cai para 2,65:1). Sobre branco não há texto dourado, com UMA exceção: o trecho final do H1 do hero ("o que você está vivendo"), em itálico com --ouro-gradiente-texto-claro (ouro escuro, todas as paradas >= 3,27:1; só para texto grande). No H1 do hero não há traço sob "Psicóloga"; o destaque é "o que você está vivendo" em itálico ouro escuro.
- Saída rápida: botão branco com borda em gradiente dourado e texto azul. Não há token --whatsapp.
- Contraste mínimo WCAG AA: 4.5:1 para texto normal, 3:1 para texto grande e elementos gráficos relevantes.
- Alternância (uma cor por seção; cada item é um <section> irmão, nunca aninhado): hero branco → [marquee dourado] → identificação azul → sobre branco → fé/ciência azul → atendimento branco → formas de atendimento azul → carreira branco → palestras azul → causa branco → FAQ azul → contato branco → rodapé azul. Classe .secao--clara/.secao--escura no próprio <section>; nenhum wrapper interno com fundo de tela cheia; nunca :nth-child. Depoimentos hidden não participa. Verifique com `node scripts/verificar-alternancia.mjs` (vizinhas iguais = erro).
- Texto azul nas claras, branco nas escuras. Cards brancos com borda em gradiente nas claras; cards --azul-card nas escuras.
- Centralize títulos, textos, cards, listas breves, botões e rodapé. Parágrafos até ~680px. Exceções: texto do hero à esquerda no desktop (≥64em) e FAQ à esquerda dentro dos cards. O checklist "Você vai desenvolver" também é centralizado (check em linha antes do texto).
- Títulos Typhone (Lora até a licença), textos Garet, auto-hospedadas. SEM eyebrows/rótulos acima dos H2 e sem numeração; único adorno: linha curta em gradiente dourado abaixo do H2 (classe .titulo-secao). Exceção: linha de profissão + CRP no hero (CFP), sem número, pontos ou ícone.
- Sem ícones decorativos, bolinhas ou marcadores soltos. Só ficam: checks do "Você vai desenvolver", +/– do FAQ, ícones dentro de botões, os pontinhos separadores das faixas e o Ψ decorativo do hero. Sem emoji. Botões com raio 12px, sem sombras pesadas; texto dos botões levemente encorpado com -webkit-text-stroke 0,4px (Garet só tem o peso Book).
- Seções com 96–128px de espaço vertical no desktop e ~64px no mobile. Movimento só em entradas suaves por IntersectionObserver, no marquee e no hover dos botões; desligar em prefers-reduced-motion.
- Header/navbar: fundo azul (#324089) com textos brancos, inclusive no menu mobile; abaixo de 80em o hambúrguer abre uma sidebar azul de tela inteira que desliza da direita (logo e botão X por cima), com links em Garet branco centralizados, traço dourado no item ativo e o botão de WhatsApp dourado; fecha com X, Esc ou clique num link, foco preso dentro; o que é dourado continua dourado (moldura do RV do logo, botão de WhatsApp, traço do item ativo).
- Hero: fundo branco, sem padding embaixo. ≥64em: duas colunas, texto à esquerda e, à direita, a foto da cliente (`assets/img/suafoto.png` + `.webp`, recorte com fundo transparente) SEM moldura, apoiada na base da seção e encostando na faixa dourada (corpo nunca cortado no meio). Atrás da foto, o símbolo da psicologia Ψ em SVG, no azul do site, desfocado (blur) e "tremido" (eco deslocado), decorativo (aria-hidden). Abaixo de 64em: coluna única centralizada, texto e depois foto. Largura máxima da foto = largura real do arquivo (408px). Sem o monograma RV no hero.
- Marquee: sem botão de pausa. Pausa só por CSS (:hover e :focus-within; a faixa tem tabindex="0" e aria-label). prefers-reduced-motion para; cópias com aria-hidden.
- Variação de seção: identificação com as frases rolando sozinhas numa faixa contínua igual à faixa dourada (só CSS, sem controle manual: sem setas, arraste ou JS; pausa com mouse em cima e foco por teclado; parada e empilhada com prefers-reduced-motion; frases em Lora itálico grande, brancas, entre aspas, separadas por pontinho dourado); Sobre centralizado, com a foto da cliente em círculo com borda em gradiente dourado ACIMA do título e quatro destaques só com título (sem descrição), em fonte menor, separados por fios verticais curtos; Fé e Ciência com UM texto único sobre os dois temas, centralizado, seguido da frase de respeito; atendimento clínico com 3 cards (Adolescentes, Adultos, Idosos) centralizados, só título e "Para quem é", texto centralizado; formas de atendimento em painéis --azul-card com imagem lateral; carreira com cards de serviço e o bloco "Você vai desenvolver" + "Como funciona" + botão SEM moldura e centralizado, sem foto; palestras só com título, texto e botão; causa em coluna única centralizada, com a caixa "Precisa de ajuda agora?" (azul, borda em gradiente) embaixo do texto; FAQ com +/– dourados; contato SEM formulário, só os canais (WhatsApp, e-mail, Facebook, Instagram, endereço) centralizados, lado a lado no desktop e empilhados no mobile.
- Ajustes do celular (< 48em): subtítulo do hero oculto (o nome completo entra na linha de profissão só no celular — span .so-mobile "Silvana Bolina, " — exigência do CFP); foto do hero e imagens das formas de atendimento mais baixas (16:9), círculo do Sobre menor (9rem); Ψ do banner menor (19rem de altura); frases da faixa "Você já se sentiu assim?" quebradas em até 3 linhas curtas (13ch), sem parar a rolagem; botões "Agendar sessão presencial/online" mostram só "Agendar sessão" (o resto fica em .so-desktop, lido por leitor de tela). Na caixa "Precisa de ajuda agora?" o número vem em cima e a descrição embaixo. Todos esses ajustes valem SÓ para o celular; tablet e desktop seguem como antes.
- Referências de Thauany Martins, Ligia Fonseca e Bruna Garcia são apenas composicionais. Não copiar textos, nomes, logotipos ou identidade visual. Se depoimentos forem exibidos no futuro, reencaixe a alternância conscientemente sem deslocar a sequência das outras seções.

## Tipografia (seção 7.3)
- Títulos: **Typhone** (fallback **Lora** 500 enquanto não houver licença). Texto: **Garet** só no peso 400 (Book), inclusive botões, rótulos e negritos (`--peso-medio` e `--peso-forte` = 400) — visual delicado, pedido da cliente. Títulos com peso 500, sem 600.
- Base de 17 a 18px, altura de linha 1.6, títulos com `clamp()`.

## Ética do CFP (seção 6) — obrigatório
1. Nome completo + CRP no hero/header **e** no rodapé.
2. Não prometer resultados ("cura", "resolva em X sessões").
3. Preço não é propaganda (sem "promoção", "sessão grátis").
4. Sem sensacionalismo e sem se promover às custas de outros profissionais.
5. Fé como valor pessoal e forma de acolher, **sem impor crença**. Nunca chamar de "psicologia cristã" como se fosse técnica. Incluir: *"Atendo pessoas de todas as crenças, com respeito à fé e à história de cada um."*
6. Depoimentos de pacientes não. Só de palestras, treinamentos e carreira, com autorização. A seção fica `hidden` até haver conteúdo aprovado.
7. Atendimento online: `TODO-CLIENTE: confirmar cadastro e-Psi`.
8. Texto pessoal (violência doméstica, família, fé) só é publicado depois da aprovação: `TODO-CLIENTE: aprovar texto pessoal`.
9. Linguagem simples, frases curtas, termo técnico explicado em uma linha.

## Segurança (seção 12)
- **Nenhum `<script>` ou `<style>` inline, nenhum atributo `style=""`, nenhum `onclick`/`on*`.** Precisa ser compatível com a CSP `script-src 'self'; style-src 'self'`. Exceção: JSON-LD.
- **Nunca usar `innerHTML` (nem `outerHTML`/`insertAdjacentHTML`) com dados do usuário.** Usar `textContent` / `createElement`.
- Link do WhatsApp montado no JS com `encodeURIComponent`. Os botões usam `data-whatsapp="chave"` (chave de `SITE_CONFIG.mensagens`; vazio = `padrao`) e um `href` de fallback (`#contato`). Cada CTA de seção tem a sua mensagem.
- Links externos com `target="_blank" rel="noopener noreferrer"`.
- Sem cookies de rastreamento, sem analytics, sem CDN. Mapa do Google só carrega depois do clique.
- Formulário de contato removido a pedido da cliente (07/10/2026): o contato é só pelos canais. Se voltar a existir: validação, limpeza dos dados, honeypot e intervalo mínimo entre envios.

## Dados pendentes
- Tudo o que a cliente ainda não enviou leva o marcador **`TODO-CLIENTE`**, igual em HTML, CSS e JS, para ser achado com uma busca. Nunca inventar CRP, telefone, endereço, formação ou depoimento.
- Fotos: placeholders neutros com `TODO-CLIENTE: foto`. Nunca usar foto de banco que pareça ser a Silvana.

## Ordem das seções do `index.html` (seção 9)
1. Header fixo · 2. Hero `#inicio` · 3. Faixa marquee · 4. Você já se sentiu assim? `#identificacao` · 5. Sobre `#sobre` · 6. Fé e Ciência `#abordagem` · 7. Atendimento clínico `#atendimento` · 8. Formas de atendimento `#formas-de-atendimento` · 9. Carreira `#carreira` · 10. Palestras e Treinamentos `#palestras` · 11. Causa `#causa` · 12. Depoimentos `#depoimentos` (`hidden`) · 13. FAQ `#faq` · 14. Contato `#contato` · 15. Rodapé · 16. Botão flutuante de WhatsApp.

Outras páginas: `politica-de-privacidade.html`, `404.html`.

## Acessibilidade
Um único H1, hierarquia de títulos correta, skip link, foco visível, `alt` em todas as imagens (decorativas com `alt=""`), cada `<section>` com `aria-labelledby`, `prefers-reduced-motion` respeitado.

## Teste local
O site funciona abrindo o HTML direto (file://); só aparecem avisos de CORS do preload das fontes no console, sem efeito. Para testar como em produção, use um servidor local, por exemplo `npx serve .` ou `python -m http.server`.
