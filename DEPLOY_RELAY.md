# Déploiement du relay GunDB

## Architecture actuelle

```
Utilisateur → GitHub Pages (HTTPS)
                ↓
          Belmo (HTTPS)                  ← https://teamcel-relay-809f.onbelmo.uk/gun (gratuit, always-on)
                ↓
          GunDB peers (fallbacks: gun.defucc.me, relay.peer.ooo)
```

- **Frontend** : GitHub Pages (`scenaristeur.github.io/teamcel`)
- **Relay principal** : Belmo.io (gratuit, toujours actif, SSL auto) — URL stable `https://teamcel-relay-809f.onbelmo.uk/gun`
- **Fallbacks** : `gun.defucc.me`, `relay.peer.ooo`
- **Backup auto-hébergé** : Hetzner VPS (`157.90.162.126`), Node.js + GunDB, port 8765, via Cloudflare Tunnel (voir plus bas)

## Belmo (relay principal)

- Déployé depuis le repo GitHub `teamcel` (branch `main`), type de déploiement **`api`** (important : le type `static_site` lance `serve` au lieu de `relay.js`)
- Build : `npm install` / Start : `node relay.js`
- URL : `https://teamcel-relay-809f.onbelmo.uk/gun` — health check : `https://teamcel-relay-809f.onbelmo.uk/health`
- Le relay lit `process.env.PORT` — Belmo fournit la variable
- Conteneur en lecture seule : `relay.js` utilise `GUN_DATA_DIR` avec fallback `/tmp` (sinon `EROFS`) et `stats: false`

## Mise à jour du peer URL dans le code

La liste des peers est centralisée dans **`peers.js`** (utilisé par `main.js` et `stats.html`).
Quand l'URL d'un relay change, modifier `peers.js` seulement, puis pusher sur GitHub.

## Installation existante

```bash
# Relay Node.js (port 8765)
/opt/teamcel-relay/
├── relay.js
├── node_modules/
├── package.json
└── package-lock.json

# PM2 processes
pm2 list
# ┌───────────────┬──────────────┐
# │ teamcel-relay │ relay.js     │  port 8765
# │ cloudflared   │ cloudflared  │  tunnel → trycloudflare.com
# └───────────────┴──────────────┘
```

### État actuel
- Relay tourne sous PM2, redémarre automatiquement
- Tunnel Cloudflare également sous PM2
- La liste des peers est centralisée dans `peers.js` (voir "Mise à jour du peer URL" ci-dessus)

## Options pour une URL stable (relay.chateaudesrobots.fr)

Maintenant que le DNS `relay.chateaudesrobots.fr → 157.90.162.126` est actif,
voici les options pour remplacer l'URL dynamique `trycloudflare.com`.

---

### Option A : Cloudflare Tunnel nommé (recommandé)

Utiliser `cloudflared tunnel create` pour créer un tunnel nommé avec
le domaine `relay.chateaudesrobots.fr`.

**Avantages** :
- Simple, ne touche pas à Discourse
- Cloudflare gère le HTTPS (certificat automatique)
- URL stable

**Inconvénients** :
- Nécessite que le DNS soit chez Cloudflare (ou utiliser un CNAME)
- Il faut passer les nameservers IONOS → Cloudflare

**Étapes** :
```bash
# 1. Créer un tunnel nommé
cloudflared tunnel create teamcel-relay

# 2. Configurer le DNS (via Cloudflare dashboard ou API)
#    relay.chateaudesrobots.fr → CNAME → teamcel-relay.trycloudflare.com

# 3. Créer config.yml
# tunnel: teamcel-relay
# ingress:
#   - hostname: relay.chateaudesrobots.fr
#     service: http://localhost:8765
#   - service: http_status:404

# 4. Remplacer la commande PM2
pm2 delete cloudflared
pm2 start cloudflared -- tunnel run teamcel-relay

# 5. Mettre peers.js à jour :
#    "https://relay.chateaudesrobots.fr/gun",
```

---

### Option B : Caddy reverse proxy

Installer Caddy sur le VPS, reconfigurer Discourse pour libérer le port 443.

**Avantages** :
- Pas besoin de Cloudflare
- Certificat Let's Encrypt automatique
- Reste sur l'infra actuelle

**Inconvénients** :
- Plus risqué : il faut modifier la configuration Docker de Discourse
- Discourse utilise Nginx en interne — peut être complexe à désentrelacer

**Étapes** :
```bash
# 1. Installer Caddy
apt install caddy

# 2. Modifier la config Discourse pour changer les ports
#    Dans /var/discord/containers/app.yml, EXPOSE:
#      - "8080:80"   # au lieu de "80:80"
#      - "8443:443"  # au lieu de "443:443"
#    Puis: ./launcher rebuild app

# 3. Configurer Caddy (/etc/caddy/Caddyfile)
#    relay.chateaudesrobots.fr {
#        reverse_proxy localhost:8765
#    }
#    forum.chateaudesrobots.fr {
#        reverse_proxy localhost:8080
#    }

# 4. Redémarrer Caddy, arrêter cloudflared

# 5. Mettre peers.js à jour :
#    "https://relay.chateaudesrobots.fr/gun",
```

---

### Option C : Certificat wildcard IONOS + serveur HTTPS dédié

Utiliser le certificat wildcard `*.chateaudesrobots.fr` d'IONOS
dans un petit serveur HTTPS sur un port non-standard (ex: 4433),
qui proxy vers `localhost:8765`.

**Avantages** :
- Ne touche pas à Discourse
- Utilise le certificat existant d'IONOS

**Inconvénients** :
- URL avec port non-standard : `https://relay.chateaudesrobots.fr:4433/gun`
- Moins propre
- Le certificat wildcard IONOS a une expiration à renouveler

**Étapes** :
```bash
# 1. Récupérer le certificat wildcard IONOS sur le VPS
#    (depuis l'interface IONOS ou SFTP)

# 2. Créer un petit serveur HTTPS avec Node.js
#    (ou utiliser Nginx/Caddy en écoute sur :4433)

# 3. Proxy vers localhost:8765

# 4. Mettre peers.js à jour :
#    "https://relay.chateaudesrobots.fr:4433/gun",
```

---

### Option D : Statu quo (actuel)

Garder le tunnel Cloudflare dynamique.

**Avantages** :
- Ça marche
- Rien à changer sur le serveur

**Inconvénients** :
- L'URL change si cloudflared redémarre
- Il faut penser à mettre à jour `peers.js` à chaque fois
- Pas fiable pour une mise en production réelle

---

## Résumé

Le relay principal est maintenant sur Belmo (URL stable). Les options ci-dessous ne concernent plus que le relay de secours Hetzner.

| Option | Stabilité | Effort | Risque | URL finale |
|--------|-----------|--------|--------|------------|
| **A** Tunnel Cloudflare nommé | ★★★★★ | Moyen | Faible | `relay.chateaudesrobots.fr/gun` |
| **B** Caddy + reconf Discourse | ★★★★★ | Élevé | Moyen | `relay.chateaudesrobots.fr/gun` |
| **C** Wildcard IONOS port non-standard | ★★★☆☆ | Moyen | Faible | `relay.chateaudesrobots.fr:4433/gun` |
| **D** Statu quo (tunnel dynamique) | ★☆☆☆☆ | Aucun | Faible | `xxxx.trycloudflare.com/gun` |

## Peer list actuelle (peers.js)

La liste des relays est centralisée dans **`peers.js`** (utilisé par `main.js` et `stats.html`).
En local, le relay `http://localhost:8765/gun` est ajouté automatiquement en tête de liste.

```js
var relayPeers = [
  'https://teamcel-relay-809f.onbelmo.uk/gun',  // ← relay principal (Belmo, gratuit, always-on)
  'https://gun.defucc.me/gun',                  // ← fallback public
  'https://relay.peer.ooo/gun'                  // ← fallback public
];
```

## Notes

- Le relay écoute sur `0.0.0.0:8765`
- Endpoint health check : `http://localhost:8765/health` (ou `https://xxxx.trycloudflare.com/health`)
- PM2 sauvegarde : `pm2 save` + `pm2 startup` (déjà fait)
- Pour voir les logs : `pm2 logs teamcel-relay` ou `pm2 logs cloudflared`
- Pour redémarrer le tunnel : `pm2 restart cloudflared`
