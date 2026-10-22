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
