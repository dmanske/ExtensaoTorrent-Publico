<p align="center"><img src="imagens/balao-torrentleech.png" alt="Prévia Torrent: balão com o pôster e a flechinha de download" width="640"></p>

<p align="center"><b>Português</b> · <a href="README.en.md">English</a> · <a href="README.es.md">Español</a></p>

# Prévia Torrent

Extensão para **Chrome** e script para **Firefox** que mostra a **imagem de um torrent quando você para o mouse no link**, sem abrir a página. No balão tem uma **flechinha para baixar o `.torrent`** na hora, e clicando na imagem ela **amplia** por cima da página.

| Site | O que aparece no balão |
|---|---|
| TorrentLeech | o pôster do filme, série ou jogo |
| PussyTorrents | a imagem de "Covers & Screens" na versão grande (a mesma que abre ao clicar na miniatura) |

Você precisa estar logado no site: a extensão usa o login que já está no seu navegador.

## Como usar

- **Pare o mouse** em cima do nome de um torrent: na lista, na busca ou em qualquer página do site. Depois de um instante aparece o balão com a imagem.
- **Flechinha verde** (canto de cima, à esquerda): baixa o `.torrent`.
- **Clique na imagem** para ampliar. Clique de novo ou aperte `Esc` para fechar. `⌘`/`Ctrl` + clique abre a imagem numa aba nova.
- O balão fica parado onde abriu, para você conseguir levar o mouse até a flechinha. Ele fecha quando você tira o mouse, aperta `Esc` ou rola a página.
- Passar o mouse rápido pelos links não abre nada. Torrent sem imagem mostra "Sem imagem", com a flechinha do lado.

## Instalar no Firefox

No Firefox, o Prévia Torrent é um **script** que roda dentro de um gerenciador de scripts.

1. Instale um gerenciador de scripts: **[Violentmonkey](https://addons.mozilla.org/firefox/addon/violentmonkey/)** (recomendado), [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/) ou [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/).
2. Clique em **[instalar o Prévia Torrent](https://raw.githubusercontent.com/dmanske/ExtensaoTorrent-Publico/main/dist/previa-torrent.user.js)**. O gerenciador abre a tela de instalação; confirme.
3. Abra (ou recarregue) a lista de torrents do site e pare o mouse num nome.

Se o link não abrir a tela de instalação: abra o arquivo [`dist/previa-torrent.user.js`](dist/previa-torrent.user.js), copie todo o conteúdo, crie um **novo script** no gerenciador (no Greasemonkey: ícone do macaquinho → "Novo script de usuário…"), cole por cima do modelo e salve.

## Instalar no Chrome

1. Baixe o `PreviaTorrent-<versão>-Chrome.zip` em **[Releases](https://github.com/dmanske/ExtensaoTorrent-Publico/releases/latest)** e descompacte. Guarde a pasta num lugar fixo: o Chrome usa a pasta direto, e se ela for apagada ou movida a extensão para de funcionar.
2. Abra `chrome://extensions`.
3. Ligue o **Modo do desenvolvedor** (canto de cima, à direita).
4. Clique em **Carregar sem compactação** e escolha a pasta descompactada (a que tem o `manifest.json`).
5. Abra (ou recarregue) a lista de torrents do site.

## Atualizar

- **Firefox:** o Violentmonkey e o Tampermonkey buscam a versão nova sozinhos. No Greasemonkey, clique de novo no link de instalação.
- **Chrome:** baixe o zip novo, troque o conteúdo da pasta e clique em ↻ na extensão, em `chrome://extensions`.

## Como funciona

1. Quando você para o mouse num link de torrent por 0,3 segundo, a extensão busca a página daquele torrent **por baixo, sem abrir**, usando o login que já está no navegador.
2. Dessa página ela pega dois endereços: o da **imagem** e o do **download** do `.torrent`.
3. Mostra a imagem num balão ao lado do mouse, com a flechinha apontando para o download.
4. Guarda o resultado enquanto a aba estiver aberta: voltar ao mesmo torrent abre na hora.

**Privacidade:** a extensão não envia nada para lugar nenhum. Ela só conversa com o próprio site (a página do torrent) e com o servidor de imagens dele; não tem servidor próprio, não coleta dados e não pede permissões extras. Ela busca uma página só quando você para o mouse num link, nunca a lista inteira de uma vez: é o mesmo que você abrir a página.

## Problemas comuns

| O que acontece | O que fazer |
|---|---|
| Não aparece balão nenhum | Confira se a extensão ou o script está ativo e recarregue a página do site. |
| "Sem imagem" | Esse torrent não tem imagem no site (comum em jogos e em alguns episódios). A flechinha funciona normalmente. |
| "o site pediu login de novo" | Sua sessão no site expirou: entre de novo. |
| "Não deu para abrir a página" | O site não respondeu; tente de novo. No Firefox, se continuar, troque o gerenciador pelo Violentmonkey. |
| Parou de funcionar de repente | O site pode ter mudado a página. Abra uma [issue](https://github.com/dmanske/ExtensaoTorrent-Publico/issues). |

## Licença

[MIT](LICENSE).
