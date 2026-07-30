# Changelog

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
