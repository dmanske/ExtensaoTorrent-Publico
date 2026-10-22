<p align="center"><img src="imagens/balao-torrentleech.png" alt="Prévia Torrent: globo con el póster y la flecha de descarga" width="640"></p>

<p align="center"><a href="README.md">Português</a> · <a href="README.en.md">English</a> · <b>Español</b></p>

# Prévia Torrent

Extensión para **Chrome** y script para **Firefox** que muestra la **imagen de un torrent al dejar el mouse sobre su enlace**, sin abrir la página. En el globo hay una **flecha para descargar el `.torrent`** al instante, y al hacer clic en la imagen se **amplía** sobre la página.

| Sitio | Qué aparece en el globo |
|---|---|
| TorrentLeech | el póster de la película, serie o juego |
| PussyTorrents | la imagen de "Covers & Screens" en tamaño grande (la misma que se abre al hacer clic en la miniatura) |

Necesitas haber iniciado sesión en el sitio: la extensión usa la sesión que ya está en tu navegador.

## Cómo usar

- **Deja el mouse** sobre el nombre de un torrent: en la lista, en la búsqueda o en cualquier página del sitio. Tras un instante aparece el globo con la imagen.
- **Flecha verde** (esquina superior izquierda): descarga el `.torrent`.
- **Haz clic en la imagen** para ampliarla. Vuelve a hacer clic o pulsa `Esc` para cerrar. `⌘`/`Ctrl` + clic abre la imagen en una pestaña nueva.
- El globo se queda donde se abrió, para que puedas llevar el mouse hasta la flecha. Se cierra al quitar el mouse, pulsar `Esc` o desplazar la página.
- Pasar el mouse rápido por los enlaces no abre nada. Un torrent sin imagen muestra "Sem imagem" (sin imagen), con la flecha al lado.

## Instalar en Firefox

En Firefox, Prévia Torrent es un **script** (userscript) que funciona dentro de un gestor de scripts.

1. Instala un gestor de scripts: **[Violentmonkey](https://addons.mozilla.org/firefox/addon/violentmonkey/)** (recomendado), [Tampermonkey](https://addons.mozilla.org/firefox/addon/tampermonkey/) o [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/).
2. Haz clic en **[instalar Prévia Torrent](https://raw.githubusercontent.com/dmanske/ExtensaoTorrent-Publico/main/dist/previa-torrent.user.js)**. El gestor abre su pantalla de instalación; confirma.
3. Abre (o recarga) la lista de torrents del sitio y deja el mouse sobre un nombre.

Si el enlace no abre la pantalla de instalación: abre [`dist/previa-torrent.user.js`](dist/previa-torrent.user.js), copia todo el contenido, crea un **nuevo script** en el gestor (en Greasemonkey: icono del mono → "Nuevo script de usuario…"), pégalo encima de la plantilla y guarda.

## Instalar en Chrome

1. Descarga `PreviaTorrent-<versión>-Chrome.zip` en **[Releases](https://github.com/dmanske/ExtensaoTorrent-Publico/releases/latest)** y descomprímelo. Guarda la carpeta en un lugar fijo: Chrome la usa directamente, y si se borra o se mueve la extensión deja de funcionar.
2. Abre `chrome://extensions`.
3. Activa el **Modo de desarrollador** (esquina superior derecha).
4. Haz clic en **Cargar descomprimida** y elige la carpeta descomprimida (la que tiene el `manifest.json`).
5. Abre (o recarga) la lista de torrents del sitio.

## Actualizar

- **Firefox:** Violentmonkey y Tampermonkey buscan la versión nueva solos. En Greasemonkey, vuelve a hacer clic en el enlace de instalación.
- **Chrome:** descarga el zip nuevo, reemplaza el contenido de la carpeta y haz clic en ↻ en la extensión, en `chrome://extensions`.

## Cómo funciona

1. Cuando dejas el mouse sobre un enlace de torrent durante 0,3 segundos, la extensión busca la página de ese torrent **en segundo plano, sin abrirla**, usando la sesión que ya está en el navegador.
2. De esa página toma dos direcciones: la de la **imagen** y la de **descarga** del `.torrent`.
3. Muestra la imagen en un globo junto al mouse, con la flecha apuntando a la descarga.
4. Guarda el resultado mientras la pestaña esté abierta: volver al mismo torrent lo abre al instante.

**Privacidad:** la extensión no envía nada a ningún lado. Solo habla con el propio sitio (la página del torrent) y con su servidor de imágenes; no tiene servidor propio, no recopila datos y no pide permisos extra. Busca una página solo cuando dejas el mouse sobre un enlace, nunca la lista entera de una vez: es lo mismo que abrir la página tú.

## Problemas comunes

| Qué pasa | Qué hacer |
|---|---|
| No aparece ningún globo | Comprueba que la extensión o el script esté activo y recarga la página del sitio. |
| "Sem imagem" (sin imagen) | Ese torrent no tiene imagen en el sitio (común en juegos y en algunos episodios). La flecha funciona igual. |
| "o site pediu login de novo" (el sitio pidió iniciar sesión otra vez) | Tu sesión en el sitio expiró: vuelve a entrar. |
| "Não deu para abrir a página" (no se pudo abrir la página) | El sitio no respondió; inténtalo de nuevo. En Firefox, si sigue pasando, cambia el gestor por Violentmonkey. |
| Dejó de funcionar de repente | El sitio puede haber cambiado su página. Abre un [issue](https://github.com/dmanske/ExtensaoTorrent-Publico/issues). |

## Licencia

[MIT](LICENSE).
