// ==UserScript==
// @name         Prévia Torrent
// @namespace    manske
// @version      0.1.1
// @description  Mostra a capa do torrent ao parar o mouse no link, sem abrir a página, com botão para baixar o .torrent.
// @match        https://*.torrentleech.org/*
// @match        https://torrentleech.org/*
// @match        https://*.pussytorrents.org/*
// @match        https://pussytorrents.org/*
// @homepageURL  https://github.com/dmanske/ExtensaoTorrent-Publico
// @downloadURL  https://raw.githubusercontent.com/dmanske/ExtensaoTorrent-Publico/main/dist/previa-torrent.user.js
// @updateURL    https://raw.githubusercontent.com/dmanske/ExtensaoTorrent-Publico/main/dist/previa-torrent.user.js
// @license      MIT
// @grant        none
// @run-at       document-idle
// ==/UserScript==

// Arquivo gerado por scripts/gerar-userscript.mjs. Não edite aqui: edite extensao/.
// Configuração central da Prévia Torrent.
// Site novo: acrescente um bloco em SITES_PREVIA e o domínio em manifest.json (matches)
// e no cabeçalho gerado por scripts/gerar-userscript.mjs.

const SITES_PREVIA = [
  {
    nome: 'TorrentLeech',
    dominios: ['torrentleech.org'],
    // Link de torrent na lista (montada por JS depois do carregamento): /torrent/241856781
    link: /^\/torrent\/\d+\/?$/,
    // Pôster na página do torrent: <div class="imdb_cover"><img src="…-large.jpg"></div>
    // (-large tem 320×480 e é o maior que existe; -noresize não existe lá)
    imagem: { seletor: '.imdb_cover img', atributo: 'src' },
    // Botão "Download Torrent": <a href="/download/241856781/<nome>.torrent">
    download: { seletor: 'a[href^="/download/"]', atributo: 'href' },
  },
  {
    nome: 'PussyTorrents',
    dominios: ['pussytorrents.org'],
    link: /^\/torrent\/\d+\/?$/,
    // "Covers & Screens": <a class="lightbox" href="…-noresize.jpg"><img src="…-thumb.jpg"></a>
    // O href é a imagem grande, a que abre ao clicar na miniatura.
    imagem: { seletor: 'a.lightbox', atributo: 'href' },
    // Botão "Download": <form action="/download/578457/<nome>.torrent" method="get">
    download: { seletor: 'form[action^="/download/"]', atributo: 'action' },
  },
];

const AJUSTES_PREVIA = {
  esperaMs: 300,        // tempo parado no link antes de buscar a página
  folgaSaidaMs: 250,    // tempo para levar o mouse do link até o balão sem ele sumir
  distanciaPx: 14,      // distância do balão até o mouse
  margemPx: 12,         // folga mínima até a borda da janela
  maxLarguraTela: 0.6,  // fração da largura da janela que o balão pode ocupar
  maxAlturaTela: 0.85,  // fração da altura da janela
  // Imagem grande (clique na imagem do balão): ocupa até 95% da tela e pode ampliar até 2× o tamanho
  // original (o pôster do TorrentLeech tem só 320×480).
  telaFracao: 0.95,
  ampliarAte: 2,
};

// Visual do balão (ver docs/design/DESIGN_SYSTEM.md).
const ESTILO_PREVIA = {
  fundo: '#141414',
  borda: 'rgba(255, 255, 255, 0.14)',
  texto: '#ececec',
  raio: '10px',
  sombra: '0 10px 28px rgba(0, 0, 0, 0.5)',
  fonte: '13px/1.3 system-ui, -apple-system, "Segoe UI", sans-serif',
  botaoFundo: '#2e7d32',
  botaoFundoHover: '#388e3c',
  botaoTamanho: '40px',
  telaFundo: 'rgba(0, 0, 0, 0.88)', // fundo atrás da imagem grande
};

// Prévia Torrent: ao parar o mouse num link de torrent, busca a página do torrent por baixo
// (com o login da própria aba), mostra a imagem num balão e põe um botão para baixar o .torrent.
// Depende de config.js (SITES_PREVIA, AJUSTES_PREVIA, ESTILO_PREVIA), carregado antes.
(() => {
  const site = SITES_PREVIA.find(s =>
    s.dominios.some(d => location.hostname === d || location.hostname.endsWith('.' + d)));
  if (!site || window.__previaTorrent) return;
  window.__previaTorrent = true;
  const A = AJUSTES_PREVIA;
  const E = ESTILO_PREVIA;

  // No Firefox, content.fetch faz o pedido como a própria página (mesmo login).
  // No Chrome, e como script do Violentmonkey/Tampermonkey, o fetch normal já faz isso.
  const buscar = typeof content === 'object' && content && typeof content.fetch === 'function'
    ? (...args) => content.fetch(...args)
    : (...args) => fetch(...args);

  // ---------- Leitura da página do torrent ----------

  const cache = new Map(); // endereço da página → Promise<{ imagem, download }>

  function lerEndereco(doc, regra, base) {
    const valor = doc.querySelector(regra.seletor)?.getAttribute(regra.atributo);
    return valor ? new URL(valor, base).href : null;
  }

  function dadosDoTorrent(url) {
    if (!cache.has(url)) {
      const pedido = buscar(url, { credentials: 'include' })
        .then(r => {
          if (r.redirected && /login/i.test(r.url)) throw new Error('o site pediu login de novo');
          if (!r.ok) throw new Error(`a página respondeu ${r.status}`);
          return r.text();
        })
        .then(html => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          return {
            imagem: lerEndereco(doc, site.imagem, url),
            download: lerEndereco(doc, site.download, url),
          };
        });
      // Erro não fica guardado: na próxima passada de mouse tenta de novo.
      pedido.catch(() => cache.delete(url));
      cache.set(url, pedido);
    }
    return cache.get(url);
  }

  function enderecoDoTorrent(a) {
    let u;
    try { u = new URL(a.getAttribute('href'), location.href); } catch { return null; }
    if (u.origin !== location.origin || !site.link.test(u.pathname)) return null;
    if (u.pathname === location.pathname) return null; // link para a própria página
    return u.origin + u.pathname;
  }

  // ---------- Balão ----------

  const hospedeiro = document.createElement('previa-torrent');
  const raiz = hospedeiro.attachShadow({ mode: 'open' });
  const caixa = document.createElement('div');
  const img = document.createElement('img');
  const aviso = document.createElement('div');
  const botao = document.createElement('a');
  const NS = 'http://www.w3.org/2000/svg';
  const icone = document.createElementNS(NS, 'svg');
  const traco = document.createElementNS(NS, 'path');
  const SETA = 'M12 4v11M7 10l5 5 5-5M5 20h14';
  const CERTO = 'M5 12.5l4.5 4.5L19 7';

  Object.assign(hospedeiro.style, {
    position: 'fixed', left: '0', top: '0', zIndex: '2147483647', display: 'none',
  });
  hospedeiro.dataset.estado = 'oculto';
  Object.assign(caixa.style, {
    position: 'relative', boxSizing: 'border-box', padding: '4px', alignItems: 'center', gap: '10px',
    background: E.fundo, border: `1px solid ${E.borda}`, borderRadius: E.raio, boxShadow: E.sombra,
    font: E.fonte, color: E.texto,
  });
  Object.assign(img.style, {
    display: 'none', width: 'auto', height: 'auto', borderRadius: `calc(${E.raio} - 4px)`,
  });
  img.alt = '';
  Object.assign(aviso.style, { padding: '6px 10px', whiteSpace: 'nowrap' });

  botao.setAttribute('download', '');
  botao.title = 'Baixar o .torrent';
  botao.setAttribute('aria-label', 'Baixar o .torrent');
  Object.assign(botao.style, {
    width: E.botaoTamanho, height: E.botaoTamanho, borderRadius: '50%', display: 'none',
    alignItems: 'center', justifyContent: 'center', flex: 'none', cursor: 'pointer',
    background: E.botaoFundo, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.45)',
  });
  // Em cima à esquerda: é o canto mais perto do mouse quando o balão abre à direita.
  const BOTAO_FLUTUANTE = { position: 'absolute', left: '12px', top: '12px' };
  const BOTAO_EM_LINHA = { position: 'static', left: '', top: '' };
  icone.setAttribute('viewBox', '0 0 24 24');
  icone.setAttribute('width', '22');
  icone.setAttribute('height', '22');
  traco.setAttribute('d', SETA);
  for (const [k, v] of Object.entries({
    fill: 'none', stroke: '#fff', 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
  })) traco.setAttribute(k, v);
  icone.append(traco);
  botao.append(icone);
  botao.addEventListener('mouseenter', () => { botao.style.background = E.botaoFundoHover; });
  botao.addEventListener('mouseleave', () => { botao.style.background = E.botaoFundo; });
  botao.addEventListener('click', () => {
    // O próprio <a download> baixa o arquivo; aqui só mostra o "feito" por um instante.
    traco.setAttribute('d', CERTO);
    setTimeout(() => traco.setAttribute('d', SETA), 1500);
  });

  // A imagem fica dentro de um link para ela mesma: clique simples amplia por cima da página
  // (como o site faz ao clicar na miniatura); ⌘/Ctrl+clique ou botão do meio abre numa aba nova.
  const linkImg = document.createElement('a');
  linkImg.target = '_blank';
  linkImg.rel = 'noopener';
  linkImg.title = 'Clique para ampliar';
  Object.assign(linkImg.style, { display: 'block', cursor: 'zoom-in' });
  linkImg.append(img);
  linkImg.addEventListener('click', ev => {
    if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    ev.preventDefault();
    ampliar(img.currentSrc || img.src);
  });

  caixa.append(linkImg, aviso, botao);
  raiz.append(caixa);
  document.documentElement.append(hospedeiro);

  // ---------- Imagem ampliada ----------
  // Host separado: o balão usa transform, e um position:fixed dentro dele não cobriria a tela toda.

  const hospedeiroTela = document.createElement('previa-torrent-tela');
  const tela = document.createElement('div');
  const imgGrande = document.createElement('img');
  Object.assign(hospedeiroTela.style, {
    position: 'fixed', inset: '0', zIndex: '2147483647', display: 'none',
  });
  hospedeiroTela.dataset.estado = 'fechada';
  Object.assign(tela.style, {
    position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: E.telaFundo, cursor: 'zoom-out',
  });
  Object.assign(imgGrande.style, { display: 'block', borderRadius: '4px', boxShadow: E.sombra });
  imgGrande.alt = '';
  tela.append(imgGrande);
  hospedeiroTela.attachShadow({ mode: 'open' }).append(tela);
  document.documentElement.append(hospedeiroTela);

  function ampliar(src) {
    esconder();
    imgGrande.onload = () => {
      const w = imgGrande.naturalWidth;
      const h = imgGrande.naturalHeight;
      const escala = Math.min(innerWidth * A.telaFracao / w, innerHeight * A.telaFracao / h, A.ampliarAte);
      imgGrande.style.width = `${Math.round(w * escala)}px`;
      imgGrande.style.height = `${Math.round(h * escala)}px`;
      hospedeiroTela.style.display = 'block';
      hospedeiroTela.dataset.estado = 'aberta';
    };
    imgGrande.src = src;
  }

  function fecharAmpliada() {
    hospedeiroTela.style.display = 'none';
    hospedeiroTela.dataset.estado = 'fechada';
    imgGrande.removeAttribute('src');
  }

  tela.addEventListener('click', fecharAmpliada);
  // Com a imagem ampliada aberta, a roda do mouse não rola a página por trás.
  tela.addEventListener('wheel', ev => ev.preventDefault(), { passive: false });

  // ---------- Estado e posição ----------

  let linkAtual = null;   // link de onde o balão saiu
  let pendente = null;    // outro link com o mouse em cima enquanto o balão está aberto
  let trocar = null;      // troca o balão para o link pendente
  let vez = 0;           // muda a cada link; respostas atrasadas de outro link são ignoradas
  let tEspera = null;
  let tSaida = null;
  let distancias = null;  // distância do mouse até a flechinha e até o balão, no último movimento
  let mouse = { x: 0, y: 0 };
  let ancora = { x: 0, y: 0 }; // ponto do mouse quando o balão abriu (o balão fica parado ali)
  let ladoDireito = true;

  function prepararTamanho() {
    const m = A.margemPx;
    const d = A.distanciaPx;
    const espacoDir = innerWidth - ancora.x - d - m;
    const espacoEsq = ancora.x - d - m;
    ladoDireito = espacoDir >= espacoEsq;
    const largura = Math.min(innerWidth * A.maxLarguraTela, Math.max(espacoDir, espacoEsq));
    const altura = innerHeight * A.maxAlturaTela;
    img.style.maxWidth = `${Math.max(120, largura - 10)}px`;
    img.style.maxHeight = `${Math.max(120, altura - 10)}px`;
  }

  function posicionar() {
    const { width: w, height: h } = caixa.getBoundingClientRect();
    const m = A.margemPx;
    const d = A.distanciaPx;
    let x = ladoDireito ? ancora.x + d : ancora.x - d - w;
    x = Math.max(m, Math.min(x, innerWidth - w - m));
    let y = ancora.y + d;
    if (y + h + m > innerHeight) y = innerHeight - h - m;
    y = Math.max(m, y);
    hospedeiro.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }

  function mostrarEstado(nome, texto = '') {
    hospedeiro.dataset.estado = nome;
    hospedeiro.style.display = 'block';
    caixa.style.display = nome === 'imagem' ? 'block' : 'flex';
    img.style.display = nome === 'imagem' ? 'block' : 'none';
    aviso.style.display = nome === 'imagem' ? 'none' : 'block';
    aviso.textContent = texto;
    const comBotao = botao.hasAttribute('href') && (nome === 'imagem' || nome === 'sem-imagem');
    botao.style.display = comBotao ? 'flex' : 'none';
    Object.assign(botao.style, nome === 'imagem' ? BOTAO_FLUTUANTE : BOTAO_EM_LINHA);
    posicionar();
  }

  async function mostrar(url) {
    const minhaVez = ++vez;
    ancora = { ...mouse };
    prepararTamanho();
    mostrarEstado('carregando', 'carregando…');
    let dados;
    try {
      dados = await dadosDoTorrent(url);
    } catch (erro) {
      if (minhaVez === vez) mostrarEstado('erro', `Não deu para abrir a página: ${erro.message}`);
      return;
    }
    if (minhaVez !== vez) return;
    hospedeiro.dataset.imagem = dados.imagem || '';
    hospedeiro.dataset.download = dados.download || '';
    if (dados.download) botao.href = dados.download;
    if (!dados.imagem) {
      mostrarEstado('sem-imagem', 'Sem imagem');
      return;
    }
    img.onload = () => { if (minhaVez === vez) mostrarEstado('imagem'); };
    img.onerror = () => { if (minhaVez === vez) mostrarEstado('erro', 'A imagem não carregou.'); };
    img.src = dados.imagem;
    linkImg.href = dados.imagem;
  }

  function esconder() {
    clearTimeout(tEspera);
    pararSaida();
    vez++;
    linkAtual = null;
    pendente = null;
    trocar = null;
    hospedeiro.style.display = 'none';
    hospedeiro.dataset.estado = 'oculto';
    img.removeAttribute('src');
    linkImg.removeAttribute('href');
    botao.removeAttribute('href');
  }

  const dentro = (el, alvo) => !!el && !!alvo && (el === alvo || alvo.contains(el));
  // "Zona" do balão: o link de origem, o próprio balão e o link pendente.
  // Eventos de dentro do balão chegam aqui com target = hospedeiro.
  const naZona = el => el === hospedeiro || dentro(el, linkAtual) || dentro(el, pendente);
  const aberto = () => hospedeiro.dataset.estado !== 'oculto';

  function cancelarPendente() {
    if (!pendente) return;
    clearTimeout(tEspera);
    pendente = null;
    trocar = null;
  }

  function pararSaida() {
    clearTimeout(tSaida);
    tSaida = null;
  }

  function agendarSaida() {
    clearTimeout(tSaida);
    tSaida = setTimeout(esconder, A.folgaSaidaMs);
  }

  function agendarTroca() {
    clearTimeout(tEspera);
    tEspera = setTimeout(trocar, A.esperaMs);
  }

  function distanciaAte(el) {
    const r = el.getBoundingClientRect();
    const dx = Math.max(r.left - mouse.x, 0, mouse.x - r.right);
    const dy = Math.max(r.top - mouse.y, 0, mouse.y - r.bottom);
    return Math.hypot(dx, dy);
  }

  const medirDistancias = () => ({
    botao: botao.style.display === 'none' ? Infinity : distanciaAte(botao),
    caixa: distanciaAte(caixa),
  });

  // ---------- Mouse e teclado ----------

  document.addEventListener('mousemove', ev => {
    mouse = { x: ev.clientX, y: ev.clientY };
    if (!aberto() || (!tSaida && !pendente)) return;
    // Mouse fora do balão mas indo na direção dele (ou da flechinha): adia o fechamento e a troca.
    // Quando o balão sobe por falta de espaço embaixo, a flechinha fica acima do mouse
    // e o caminho até ela passa por fora do balão, cruzando outras linhas da lista.
    const agora = medirDistancias();
    const antes = distancias || agora;
    distancias = agora;
    if (agora.botao < antes.botao - 0.5 || agora.caixa < antes.caixa - 0.5) {
      if (tSaida) agendarSaida();
      if (pendente) agendarTroca();
    }
  }, { capture: true, passive: true });

  document.addEventListener('mouseover', ev => {
    mouse = { x: ev.clientX, y: ev.clientY };
    if (ev.target === hospedeiro || dentro(ev.target, linkAtual)) {
      pararSaida();
      cancelarPendente(); // estava só passando por outro link a caminho do balão
      return;
    }
    const a = ev.target.closest?.('a[href]');
    const url = a && enderecoDoTorrent(a);
    if (!url || a === pendente) return;
    if (aberto()) {
      // Balão aberto: só troca de torrent se o mouse parar neste outro link,
      // porque ele pode estar só cruzando o link no caminho até a flechinha.
      pararSaida();
      cancelarPendente();
      pendente = a;
      trocar = () => {
        esconder();
        linkAtual = a;
        mostrar(url);
      };
      distancias = medirDistancias();
      agendarTroca();
      return;
    }
    esconder();
    linkAtual = a;
    tEspera = setTimeout(() => mostrar(url), A.esperaMs);
  }, true);

  document.addEventListener('mouseout', ev => {
    if (!linkAtual || !naZona(ev.target) || naZona(ev.relatedTarget)) return;
    if (!aberto()) {
      esconder(); // ainda nem abriu: cancela sem esperar
      return;
    }
    mouse = { x: ev.clientX, y: ev.clientY };
    cancelarPendente();
    distancias = medirDistancias();
    agendarSaida();
  }, true);

  document.addEventListener('keydown', ev => {
    if (ev.key !== 'Escape') return;
    esconder();
    fecharAmpliada();
  }, true);
  // Só a rolagem da página (sem capture: rolagem de quadros internos, como chat, não fecha).
  window.addEventListener('scroll', () => { if (linkAtual) esconder(); }, { passive: true });
  window.addEventListener('blur', esconder);
})();
