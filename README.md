# Espaço Revolução de Vidas

Site institucional de Silvana Bolina, psicóloga clínica e organizacional. O site apresenta psicoterapia, carreira, palestras e treinamentos e prepara contatos pelo WhatsApp. Ele não usa servidor próprio para guardar os dados do formulário.

## Arquivos principais

- `index.html`: conteúdo da página principal e das seções.
- `politica-de-privacidade.html` e `404.html`: páginas auxiliares.
- `assets/css/`: estilos e cores do site.
- `assets/js/main.js`: menu, formulário, redes, WhatsApp, mapa e outros comportamentos.
- `assets/img/`: imagens atuais, ainda provisórias.
- `assets/fonts/`: fontes hospedadas no próprio site. Texto em Garet (gratuita, EULA na pasta). Títulos em Lora até a compra da licença do Typhone: salve `typhone-regular.woff2` na pasta e descomente o bloco `@font-face` marcado com `TODO-CLIENTE` em `assets/css/base.css`.
- `PENDENCIAS-CLIENTE.md`: informações que ainda precisamos confirmar com Silvana.

## Como editar os textos

Edite `index.html` para mudar os textos da página principal. Os nomes das seções, perguntas frequentes, textos dos botões e descrições dos serviços também ficam nesse arquivo. Para editar a Política de Privacidade ou a página de erro, abra os respectivos arquivos HTML.

Use frases simples e não prometa resultados da terapia. Não publique a história pessoal de Silvana nem depoimentos antes de receber a aprovação expressa e, para depoimentos de palestras, treinamentos ou carreira, a autorização por escrito. Não publique depoimentos de pacientes. A seção de depoimentos fica oculta até ser revisada.

Faça as mudanças nos arquivos-fonte. Não edite `dist/`: o build apaga e recria essa pasta.

## Como trocar fotos e logo

1. Coloque as fotos autorizadas em `assets/img/` com nomes claros, como `silvana-bolina-psicologa.webp`.
2. Em `index.html`, localize a imagem com o comentário `TODO-CLIENTE: foto` e atualize o caminho, o texto `alt`, a largura e a altura. Para fotos AVIF/WebP, prefira `<picture>` com uma imagem JPG de fallback.
3. Use uma foto profissional da própria Silvana. Não use imagem de banco que possa ser confundida com ela.
4. Se houver logo aprovado, substitua o logo tipográfico no HTML e atualize também o favicon, o ícone de tela inicial e a imagem social.

O arquivo `og-image.jpg` é uma imagem provisória criada com as cores do site. Para recriá-la no Windows, rode `npm run generate:assets`.

## Como trocar WhatsApp, e-mail e redes sociais

Abra `assets/js/main.js` e edite o objeto `SITE_CONFIG`, no início do arquivo:

- `whatsapp`: somente números, com código do Brasil e DDD, por exemplo `5511999999999`.
- `email`: e-mail profissional autorizado.
- `redes.facebook` e `redes.instagram`: endereços completos iniciados por `https://`.
- `mapa.endereco`: endereço do consultório. `mapa.embedUrl` é opcional.

Os cartões de contato exibem os valores configurados. O endereço do consultório e a cidade também precisam ser atualizados no texto do HTML, no JSON-LD, no sitemap e nos demais locais marcados `TODO-CLIENTE`. Não inclua dados pessoais sem autorização.

## Verificar a alternância de fundos

Depois de mexer nas seções, rode `node scripts/verificar-alternancia.mjs` (usa o Chrome instalado via `playwright-core`; sem ele, faz uma leitura estática do HTML e do CSS). O script lista cada seção com o fundo calculado e acusa erro se duas seções vizinhas tiverem o mesmo fundo.

## Build e teste local

É necessário Node.js e npm para minificar os arquivos de produção. O site publicado não carrega dependências de terceiros.

```bash
npm install
npm run build
```

O resultado para publicação fica em `dist/`. Para recriar os ícones e a imagem social provisória no Windows, rode antes:

```bash
npm run generate:assets
```

Para abrir uma prévia local, inicie um servidor na pasta `dist/`, por exemplo:

```bash
python -m http.server 8000 --directory dist
```

Depois, acesse `http://localhost:8000`. Teste o site por um servidor, não abrindo o HTML como arquivo `file://`.

## Publicação em hospedagem compartilhada (Hostinger ou HostGator)

1. Preencha e revise todos os itens de `PENDENCIAS-CLIENTE.md` que forem necessários para a publicação.
2. Rode `npm run build` e abra a pasta `dist/`.
3. No painel da hospedagem, abra o Gerenciador de Arquivos ou crie uma conexão FTP/SFTP com as credenciais da própria hospedagem.
4. Abra a pasta raiz do domínio. Em muitos planos ela se chama `public_html`; confira no painel se o domínio usa outra pasta.
5. Envie **o conteúdo** de `dist/` para essa pasta, incluindo os arquivos ocultos `.htaccess` e `_headers` e a pasta `.well-known`. Não envie a pasta do projeto inteira, `node_modules`, `prompt.md` ou `CLAUDE.md`.
6. Confira se `index.html` está diretamente na raiz publicada. Em hospedagem Apache, mantenha o `.htaccess` para as regras de segurança e redirecionamento. Configure o domínio principal para a versão sem `www`, como prevê esse arquivo.
7. Ative o certificado SSL/HTTPS no painel da hospedagem e teste a versão `http://` e as formas com e sem `www`; todas devem chegar à URL HTTPS principal sem ciclos de redirecionamento.

Ajuda oficial: [arquivos na Hostinger](https://support.hostinger.com/pt/collections/944821-gerenciamento-de-arquivos), [enviar arquivos no HostGator](https://www.hostgator.com/help/article/how-to-upload-a-file-using-the-file-manager) e [pasta public_html do HostGator](https://www.hostgator.com/help/article/public-html-folder).

## Publicação na Netlify

**Envio manual:** rode `npm run build` e envie a pasta `dist/` pela área de deploy manual da Netlify. A Netlify publica os arquivos já gerados.

**Ligada a um repositório Git:** importe o repositório e configure:

- Comando de build: `npm run build`
- Pasta publicada: `dist`
- Diretório base: raiz do repositório

O arquivo `_headers` está dentro de `dist/` e configura os cabeçalhos. Veja a [configuração de build da Netlify](https://docs.netlify.com/build/configure-builds/overview/) e o [guia de deploy manual](https://docs.netlify.com/deploy/create-deploys/).

## Publicação na Vercel

Importe o repositório na Vercel. Nas configurações de build, escolha o preset **Other** e use:

- Comando de build: `npm run build`
- Pasta de saída: `dist`
- Diretório raiz: raiz do repositório

O `vercel.json` que acompanha o site aplica os cabeçalhos. Veja as [configurações de build da Vercel](https://vercel.com/docs/builds/configure-a-build) e a referência de [`vercel.json`](https://vercel.com/docs/project-configuration/vercel-json).

## Publicação no Cloudflare Pages

**Ligada a um repositório Git:** crie um projeto Pages, conecte o repositório e configure o comando `npm run build` e a pasta de saída `dist`.

**Envio direto:** rode `npm run build` e envie a pasta `dist/` em Workers & Pages → Create application → Pages → Direct Upload. Esse caminho publica a versão pronta e não permite converter depois o mesmo projeto para integração Git; escolha integração Git desde o começo se quiser deploy automático a cada atualização.

O arquivo `_headers` fica na pasta publicada. Consulte o [guia de site HTML estático](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/) e o [envio direto](https://developers.cloudflare.com/pages/get-started/direct-upload/).

## Domínio `.com.br` e HTTPS

1. Escolha um domínio disponível e registre-o no [Registro.br](https://registro.br/). A titular da conta deve guardar o acesso e manter os dados cadastrais atualizados.
2. No painel do domínio, configure os servidores DNS ou registros informados pela hospedagem escolhida. Os valores são diferentes em cada provedor; copie os dados exibidos no painel em vez de usar valores de exemplo.
3. Adicione o domínio ao painel da hospedagem e defina como principal a versão sem `www`. O `.htaccess` redireciona HTTP para HTTPS e `www` para o domínio sem `www`; confirme que o painel não está configurado para redirecionar no sentido oposto.
4. Substitua o domínio de exemplo marcado `TODO-CLIENTE` em canonical, Open Graph, JSON-LD, `robots.txt`, `sitemap.xml` e `.well-known/security.txt`. Revise também os redirecionamentos no `.htaccess`.
5. Ative HTTPS no painel e espere o certificado ser emitido. Só então teste a URL final e confirme que não há alertas de certificado nem redirecionamentos repetidos.

O registro de domínios `.br` e as instruções de DNS estão no [Registro.br](https://registro.br/ajuda/registro-de-novos-dominios/). Em hospedagem compartilhada, confirme com o provedor se o certificado está ativo antes de deixar o redirecionamento obrigatório em produção.

## Checklist depois da publicação

- [ ] Abra o site em celular e computador; teste menu, âncoras, WhatsApp, formulário e mapa.
- [ ] Faça um envio de teste pelo formulário, sem dados sensíveis, e confirme o texto que aparece no WhatsApp.
- [ ] Teste a página `404.html`, o botão “Saída rápida” e os links de ajuda.
- [ ] Confira se canonical, redes, telefone, CRP, endereço e políticas exibem apenas dados aprovados.
- [ ] Cadastre e verifique o domínio no [Google Search Console](https://search.google.com/search-console/). Envie `https://SEU-DOMINIO/sitemap.xml` no relatório de Sitemaps e confira o resultado. O envio informa ao Google onde está o sitemap; não garante indexação.
- [ ] Confira se `https://SEU-DOMINIO/robots.txt` e `https://SEU-DOMINIO/sitemap.xml` abrem corretamente.
- [ ] Se Silvana atende presencialmente clientes ou se desloca para atendê-los, confira a elegibilidade e as regras antes de criar um [Perfil da Empresa no Google](https://support.google.com/business/answer/13763036?hl=pt). Um serviço exclusivamente on-line não é elegível.
- [ ] Teste os cabeçalhos da URL publicada em [securityheaders.com](https://securityheaders.com/). Leia os resultados junto com a configuração do provedor.
- [ ] Confira o certificado HTTPS, links externos, carregamento das imagens e a versão sem `www` e com `www`.

## Pendências

Tudo o que ainda depende de confirmação está sinalizado com `TODO-CLIENTE`. A lista em linguagem simples está em [`PENDENCIAS-CLIENTE.md`](PENDENCIAS-CLIENTE.md). Não publique o site com o domínio provisório, CRP faltando ou dados de contato incorretos.
