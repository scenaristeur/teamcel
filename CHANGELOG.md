# Changelog

## 0.0.1-c (2026-08-02)

### Added
- **Belmo relay** — relay GunDB toujours actif, gratuit, déployé sur Belmo.io : `https://teamcel-relay-809f.onbelmo.uk/gun` (type `api`, start `node relay.js`)
- **`peers.js`** — configuration partagée des relays (`TeamCelPeers.defaults()` / `withCustom()`), utilisée par `main.js` et `stats.html`
- **`style.css`** — feuille de style externe partagée (CSS extrait de `index.html`, base commune réutilisée par `stats.html`)
- **Peer local dynamique** — `http://localhost:8765/gun` ajouté automatiquement quand on ouvre TeamCel en local (localhost/127.0.0.1)

### Changed
- **`main.js`** — utilise `TeamCelPeers.withCustom()` (suppression du bloc peers dupliqué) ; le support `?peers=...` est conservé
- **`stats.html`** — utilise `TeamCelPeers.defaults()` + `style.css` ; le CSS spécifique (rooms, status-bar) reste inline
- **`index.html`** — CSS inline remplacé par `<link rel="stylesheet" href="style.css">` ; charge `peers.js`
- **`sw.js`** — cache `v3`, pré-cache de `style.css` et `peers.js`
- **`package.json`** — scripts dev : `npm run dev` (http-server seul), `npm run dev_with_relay` (relay + http-server via concurrently), `npm run relay` (relay seul)

### Fixed
- **`relay.js`** — dossier de données configurable (`GUN_DATA_DIR`, fallback `/tmp`) pour les conteneurs en lecture seule (`EROFS`) ; `stats: false` pour éviter le spam de logs dans les stats GunDB

## 0.0.1-b (2026-07-31)

### Added
- **Shiper relay** — deployment on free Node.js hosting `https://teamcel.on.shiper.app/gun` (stable URL, SSL auto, Hetzner Cloud)

### Changed
- **Peer list** — added Shiper relay as primary peer in `main.js` and `stats.html`; Cloudflare tunnel kept as backup
- **`package.json`** — added `start` script (`node relay.js`) for Shiper deployment
- **`DEPLOY_RELAY.md`** — updated architecture: Shiper primary, Cloudflare Tunnel + Hetzner as backup
- **DNS relay.chateaudesrobots.fr** — resolves to Hetzner VPS (157.90.162.126). Documented HTTPS options for future migration.

## 0.0.1-b (2026-07-30)

### Added
- **Local GunDB relay** (`relay.js`) — Node.js relay server on port 8765 for message persistence and sync between users
- **Cloudflare Tunnel deployment** — relay accessible via HTTPS on `trycloudflare.com`, bypassing Discourse port conflict on Hetzner VPS
- **Room registry** (`teamcel-registry`) — registers active rooms in GunDB for discovery
- **Presence heartbeat** (`teamcel-presence`) — writes user presence every 30s per room
- **Stats page** (`stats.html`) — lists active rooms and connected users by reading GunDB registry + presence data
- **Debug script** (`debug.js`) — Node.js script to monitor GunDB messages in a room
- **`render.yaml`** — Render blueprint config (unused, replaced by Hetzner deployment)
- **`DEPLOY_RELAY.md`** — deployment documentation
- **`CHANGELOG.md`** — this file
- **Last 5 rooms** on landing page — stored in localStorage, shown as clickable chips between Entrer and Stats link
- **Brand click** — clicking "TeamCel" in chat header navigates back to landing page
- **Pseudo persistence** — username saved in `sessionStorage`, restored on navigation within same tab
- **Room-aware toast** — pseudo dialog shown only when joining a different room (not on return from stats)

### Changed
- **GunDB key**: `iframe-chat` → `teamcel` (root key for messages)
- **Peer list**: removed dead relays (`shogun-relay.scobrudot.dev`, `sudorecords.scobrudot.dev`, `gun.o8.is`), added local relay + Cloudflare tunnel + `relay.peer.ooo`
- **Service worker**: cache name `v2`, no root path cache (fixes Firefox `NS_ERROR_CORRUPTED_CONTENT`), network-first strategy, added SVG icon caching
- **Stats page peers**: updated to match main.js peer list
- **`package.json`**: moved `gun` to `dependencies`, added `concurrently` for dev script
- **Version**: `0.0.1-b`

### Fixed
- **Message sync**: broken because public GunDB relays were dead. Fixed by running local relay on Hetzner + Cloudflare Tunnel for HTTPS access
- **Firefox PWA crash**: removed `'./'` from service worker cache URLs
- **Safe area padding**: added `env(safe-area-inset-top)` to header for iOS PWA
- **Page height**: replaced `100vh`/`100dvh` with `html, body { height: 100% }` for correct PWA display
- **Stats back link**: now preserves room parameter, returns to the correct room instead of landing page
- **Flair restoration**: flair input value restored from `localStorage` on page reload
