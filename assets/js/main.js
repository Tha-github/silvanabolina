/**
 * Espaço Revolução de Vidas — script principal
 * Script único, sem dependências, carregado com defer (script clássico, não
 * "module": assim também funciona ao abrir o arquivo direto, via file://).
 * Regras: nada de innerHTML com dados do usuário; links externos com noopener noreferrer.
 */
'use strict';

/* ==========================================================================
   Configuração central — edite aqui (dados pendentes marcados com TODO-CLIENTE)
   ========================================================================== */
const SITE_CONFIG = Object.freeze({
  // TODO-CLIENTE: número do WhatsApp no formato 55DDXXXXXXXXX (só dígitos)
  whatsapp: 'TODO-CLIENTE',
  // Mensagem que já vem escrita no WhatsApp. Cada botão escolhe a sua com
  // data-whatsapp="chave"; sem chave (ou chave desconhecida) usa "padrao".
  mensagens: Object.freeze({
    padrao: 'Olá, Silvana! Vim pelo site e gostaria de agendar uma conversa.',
    atendimento: 'Olá, Silvana! Gostaria de agendar uma sessão de psicoterapia.',
    presencial: 'Olá, Silvana! Gostaria de agendar uma sessão presencial.',
    online: 'Olá, Silvana! Gostaria de agendar uma sessão online.',
    carreira: 'Olá, Silvana! Quero cuidar da minha carreira e gostaria de conversar sobre meus próximos passos profissionais.',
    palestras: 'Olá, Silvana! Gostaria de solicitar uma proposta de palestra ou treinamento.',
  }),
  // TODO-CLIENTE: e-mail profissional
  email: 'TODO-CLIENTE',
  redes: Object.freeze({
    // TODO-CLIENTE: links completos, começando com https://
    facebook: 'TODO-CLIENTE',
    instagram: 'TODO-CLIENTE',
  }),
  mapa: Object.freeze({
    // TODO-CLIENTE: endereço completo do consultório (rua, número, bairro, cidade - UF)
    endereco: 'TODO-CLIENTE',
    // Opcional: link "Incorporar um mapa" do Google Maps (https://www.google.com/maps/embed?pb=...).
    // Vazio = o mapa é montado a partir do endereço acima.
    embedUrl: '',
  }),
});

const DESKTOP = window.matchMedia('(min-width: 80em)');

/* ==========================================================================
   Utilitários
   ========================================================================== */
const whatsappValido = (numero) => /^55\d{10,11}$/.test(numero);

const urlSegura = (url) => typeof url === 'string' && url.startsWith('https://');

function linkExterno(el, href) {
  el.href = href;
  el.target = '_blank';
  el.rel = 'noopener noreferrer';
}

const pendente = (valor) => !valor || valor.includes('TODO-CLIENTE');

function montarLinkWhatsApp(chave = 'padrao') {
  if (!whatsappValido(SITE_CONFIG.whatsapp)) return null;
  const mensagem = SITE_CONFIG.mensagens[chave] || SITE_CONFIG.mensagens.padrao;
  return `https://wa.me/${SITE_CONFIG.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

/* ==========================================================================
   Links de WhatsApp e redes sociais
   Botões usam data-whatsapp="chave", onde a chave é uma de SITE_CONFIG.mensagens.
   Enquanto o número não estiver configurado, o href de fallback (#contato) é mantido.
   ========================================================================== */
function iniciarLinks() {
  document.querySelectorAll('[data-whatsapp]').forEach((el) => {
    const href = montarLinkWhatsApp(el.dataset.whatsapp || undefined);
    if (href) linkExterno(el, href);
    else if (el.hasAttribute('data-whatsapp-card')) {
      el.removeAttribute('href');
      el.setAttribute('aria-disabled', 'true');
    }
  });

  document.querySelectorAll('[data-email]').forEach((el) => {
    const email = SITE_CONFIG.email;
    if (typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !email.includes('TODO-CLIENTE')) {
      el.href = `mailto:${email}`;
      el.textContent = email;
    } else {
      el.removeAttribute('href');
      el.setAttribute('aria-disabled', 'true');
    }
  });

  document.querySelectorAll('[data-rede]').forEach((el) => {
    const url = SITE_CONFIG.redes[el.dataset.rede];
    if (urlSegura(url) && !url.includes('TODO-CLIENTE')) {
      linkExterno(el, url);
    } else {
      el.removeAttribute('href');
      el.removeAttribute('target');
      el.removeAttribute('rel');
      el.setAttribute('aria-disabled', 'true');
    }
  });
}

/* ========================================================================== 
   Botão flutuante do WhatsApp: esconde no rodapé e sobe durante a Saída rápida.
   ========================================================================== */
function iniciarWhatsAppFlutuante() {
  const botao = document.querySelector('[data-whatsapp-flutuante]');
  if (!botao || !botao.href.startsWith('https://wa.me/')) return;

  const rodape = document.querySelector('.site-footer');
  const causa = document.querySelector('#causa');
  let rodapeVisivel = false;
  let causaVisivel = false;

  const atualizar = () => {
    botao.hidden = rodapeVisivel;
    botao.classList.toggle('is-subido', causaVisivel && !rodapeVisivel);
  };

  if (!('IntersectionObserver' in window)) {
    const atualizarFallback = () => {
      const emTela = (elemento) => {
        if (!elemento) return false;
        const limites = elemento.getBoundingClientRect();
        return limites.bottom > 0 && limites.top < window.innerHeight;
      };
      rodapeVisivel = emTela(rodape);
      causaVisivel = emTela(causa);
      atualizar();
    };
    window.addEventListener('scroll', atualizarFallback, { passive: true });
    window.addEventListener('resize', atualizarFallback);
    atualizarFallback();
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (entrada.target === rodape) rodapeVisivel = entrada.isIntersecting;
      if (entrada.target === causa) causaVisivel = entrada.isIntersecting;
    }
    atualizar();
  }, { threshold: 0.01 });

  if (rodape) observador.observe(rodape);
  if (causa) observador.observe(causa);
  atualizar();
}

/* ==========================================================================
   Header: fundo ao rolar + aria-current no link da seção visível
   ========================================================================== */
function iniciarHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  const links = [...header.querySelectorAll('.nav__link[href^="#"]')];
  const alvos = links
    .map((link) => ({ link, secao: document.getElementById(link.hash.slice(1)) }))
    .filter((item) => item.secao);

  let agendado = false;

  function atualizar() {
    agendado = false;
    header.classList.toggle('is-rolado', window.scrollY > 8);

    // Seção ativa: a última cujo topo já passou de 35% da tela.
    // Seções fora do menu (ex.: #identificacao) contam para o item anterior.
    const linhaDeCorte = window.innerHeight * 0.35;
    const noFim = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let ativo = alvos[0];
    for (const item of alvos) {
      if (item.secao.getBoundingClientRect().top <= linhaDeCorte) ativo = item;
    }
    if (noFim) ativo = alvos[alvos.length - 1];

    for (const { link } of alvos) {
      if (link === ativo?.link) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  }

  function agendar() {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(atualizar);
  }

  window.addEventListener('scroll', agendar, { passive: true });
  window.addEventListener('resize', agendar, { passive: true });
  atualizar();
}

/* ==========================================================================
   Menu mobile acessível
   aria-expanded/aria-controls · Esc fecha · clique em link fecha · foco preso
   ========================================================================== */
function iniciarMenu() {
  const header = document.querySelector('[data-header]');
  const botao = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (!header || !botao || !nav) return;

  // Conteúdo fora do header fica inerte enquanto o menu está aberto
  const foraDoMenu = [...document.body.children].filter((el) => el !== header && el.tagName !== 'SCRIPT');

  const focaveis = () => [
    botao,
    ...nav.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
  ];

  const estaAberto = () => botao.getAttribute('aria-expanded') === 'true';

  function abrir() {
    botao.setAttribute('aria-expanded', 'true');
    nav.classList.add('is-aberto');
    header.classList.add('is-menu-aberto');
    document.documentElement.classList.add('menu-aberto');
    foraDoMenu.forEach((el) => { el.inert = true; });
    document.addEventListener('keydown', aoTeclar);
    nav.querySelector('a[href]')?.focus();
  }

  function fechar({ devolverFoco = true } = {}) {
    if (!estaAberto()) return;
    botao.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-aberto');
    header.classList.remove('is-menu-aberto');
    document.documentElement.classList.remove('menu-aberto');
    foraDoMenu.forEach((el) => { el.inert = false; });
    document.removeEventListener('keydown', aoTeclar);
    if (devolverFoco) botao.focus();
  }

  function aoTeclar(evento) {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      fechar();
      return;
    }
    if (evento.key !== 'Tab') return;

    const lista = focaveis();
    const primeiro = lista[0];
    const ultimo = lista[lista.length - 1];

    if (evento.shiftKey && document.activeElement === primeiro) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primeiro.focus();
    } else if (!lista.includes(document.activeElement)) {
      evento.preventDefault();
      primeiro.focus();
    }
  }

  botao.addEventListener('click', () => (estaAberto() ? fechar() : abrir()));

  nav.addEventListener('click', (evento) => {
    if (evento.target.closest('a')) fechar({ devolverFoco: false });
  });

  // Ao passar para o layout desktop, o menu volta ao estado normal
  DESKTOP.addEventListener('change', (evento) => {
    if (evento.matches) fechar({ devolverFoco: false });
  });
}

/* ==========================================================================
   Mapa do consultório — o iframe do Google só é criado depois do clique
   (sem rastreamento antes do consentimento; prompt.md, seção 12.6)
   ========================================================================== */
function urlDoMapa() {
  const { embedUrl, endereco } = SITE_CONFIG.mapa;
  if (embedUrl && embedUrl.startsWith('https://www.google.com/maps/embed')) return embedUrl;
  if (pendente(endereco)) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(endereco)}&output=embed`;
}

function iniciarMapa() {
  document.querySelectorAll('[data-mapa]').forEach((bloco) => {
    const botao = bloco.querySelector('[data-mapa-botao]');
    const area = bloco.querySelector('[data-mapa-area]');
    const aviso = bloco.querySelector('[data-mapa-aviso]');
    if (!botao || !area) return;

    botao.addEventListener('click', () => {
      const src = urlDoMapa();
      if (!src) {
        if (aviso) aviso.textContent = 'O mapa estará disponível assim que o endereço for confirmado.';
        return;
      }

      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.title = 'Mapa com a localização do consultório de Silvana Bolina';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.width = '600';
      iframe.height = '400';
      iframe.className = 'mapa__iframe';

      area.replaceChildren(iframe);
      area.hidden = false;
      botao.hidden = true;
      if (aviso) aviso.textContent = 'Mapa carregado.';
      iframe.focus();
    });
  });
}

/* ==========================================================================
   Animação de entrada suave ([data-reveal])
   Só é ligada com IntersectionObserver disponível e sem movimento reduzido;
   caso contrário o conteúdo já aparece normalmente.
   ========================================================================== */
function iniciarReveal() {
  const itens = document.querySelectorAll('[data-reveal]');
  const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!itens.length || movimentoReduzido || !('IntersectionObserver' in window)) return;

  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      // Também revela o que ficou acima da tela (rolagem rápida ou salto por âncora)
      const jaPassou = entrada.boundingClientRect.bottom < 0;
      if (!entrada.isIntersecting && !jaPassou) continue;
      entrada.target.classList.add('is-visivel');
      observador.unobserve(entrada.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

  document.documentElement.classList.add('reveal-ativo');
  itens.forEach((el) => observador.observe(el));
}

/* ========================================================================== 
   Saída rápida: botão visível enquanto a seção da causa está na tela.
   Escape duas vezes em sequência também troca a página sem guardar o histórico.
   ========================================================================== */
function iniciarSaidaRapida() {
  const causa = document.querySelector('#causa');
  const botao = document.querySelector('[data-saida-rapida]');
  if (!causa || !botao) return;

  const destino = 'https://www.google.com/search?q=previsao+do+tempo';
  let causaVisivel = false;
  let primeiraTecla = 0;

  const sair = () => window.location.replace(destino);
  botao.addEventListener('click', sair);

  if ('IntersectionObserver' in window) {
    const observador = new IntersectionObserver(([entrada]) => {
      causaVisivel = entrada.isIntersecting;
      botao.hidden = !causaVisivel;
      if (!causaVisivel) primeiraTecla = 0;
    }, { threshold: 0.01 });
    observador.observe(causa);
  } else {
    const atualizarVisibilidade = () => {
      const limites = causa.getBoundingClientRect();
      causaVisivel = limites.bottom > 0 && limites.top < window.innerHeight;
      botao.hidden = !causaVisivel;
      if (!causaVisivel) primeiraTecla = 0;
    };
    window.addEventListener('scroll', atualizarVisibilidade, { passive: true });
    window.addEventListener('resize', atualizarVisibilidade);
    atualizarVisibilidade();
  }

  document.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Escape' || evento.repeat) return;
    const menu = document.querySelector('[data-nav-toggle]');
    if (!causaVisivel || menu?.getAttribute('aria-expanded') === 'true') {
      primeiraTecla = 0;
      return;
    }

    const agora = performance.now();
    if (primeiraTecla && agora - primeiraTecla <= 1500) {
      primeiraTecla = 0;
      sair();
      return;
    }
    primeiraTecla = agora;
  }, { capture: true });
}

/* ==========================================================================
   Ano automático no rodapé
   ========================================================================== */
function iniciarAno() {
  document.querySelectorAll('[data-ano]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

iniciarLinks();
iniciarHeader();
iniciarMenu();
iniciarMapa();
iniciarReveal();
iniciarSaidaRapida();
iniciarWhatsAppFlutuante();
iniciarAno();
