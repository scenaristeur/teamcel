# Déploiement du relay GunDB

## Architecture actuelle

```
Utilisateur → GitHub Pages (HTTPS)
                ↓
          Shiper (HTTPS)                ← https://teamcel.on.shiper.app/gun (stable, gratuit)
                ↓
          Cloudflare Tunnel (HTTPS)     ← URL dynamique, secours
                ↓
          Hetzner VPS :8765 (relay.js)
                ↓
          GunDB peers (fallbacks: gun.defucc.me, relay.peer.ooo)
```

- **Frontend** : GitHub Pages (`scenaristeur.github.io/teamcel`)
- **Relay principal** : Shiper (gratuit, Hetzner Cloud, SSL auto) — URL stable `https://teamcel.on.shiper.app/gun`
- **Relay secondaire** : Hetzner VPS (`157.90.162.126`), Node.js + GunDB, port 8765, via Cloudflare Tunnel
- **DNS** : `relay.chateaudesrobots.fr` → `157.90.162.126` ✓ (propagé)
- **Fallbacks** : `gun.defucc.me`, `relay.peer.ooo`
- **Gestion des processus (VPS)** : PM2 (`teamcel-relay` = relay.js, `cloudflared` = tunnel)

## Shiper (relay principal)

- Déployé depuis le repo GitHub `teamcel` (template Node.js)
- Build : `npm install` / Start : `npm start` (`node relay.js`)
- URL : `https://teamcel.on.shiper.app/gun`
- Le relay lit `process.env.PORT` — Shiper fournit la variable
- Plan Hobby gratuit : 0.25 vCPU, 256 MiB (suffisant pour GunDB)

## Pourquoi Cloudflare Tunnel (encore) ?

Le port 80/443 de la machine est occupé par Discourse dans Docker (forum.chateaudesrobots.fr).
Cloudflare Tunnel contourne ce problème : il établit une connexion sortante depuis le VPS vers Cloudflare,
qui sert le HTTPS en edge. Aucun port ouvert nécessaire.

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
- L'URL du tunnel est dans `main.js:48` et `stats.html:227`

## Mise à jour du peer URL dans le code

Quand le tunnel redémarre ou que l'URL change :

```js
// Dans main.js et stats.html, modifier le premier peer :
"https://NOUVEAU-URL.trycloudflare.com/gun",
```

Pusher sur GitHub.

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

# 5. Mettre main.js et stats.html à jour :
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

# 5. Mettre main.js et stats.html à jour :
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

# 4. Mettre main.js et stats.html à jour :
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
- Il faut penser à mettre à jour main.js + stats.html à chaque fois
- Pas fiable pour une mise en production réelle

---

## Résumé

Le relay principal est maintenant sur Shiper (URL stable). Les options ci-dessous ne concernent plus que le relay de secours Hetzner.

| Option | Stabilité | Effort | Risque | URL finale |
|--------|-----------|--------|--------|------------|
| **A** Tunnel Cloudflare nommé | ★★★★★ | Moyen | Faible | `relay.chateaudesrobots.fr/gun` |
| **B** Caddy + reconf Discourse | ★★★★★ | Élevé | Moyen | `relay.chateaudesrobots.fr/gun` |
| **C** Wildcard IONOS port non-standard | ★★★☆☆ | Moyen | Faible | `relay.chateaudesrobots.fr:4433/gun` |
| **D** Statu quo (tunnel dynamique) | ★☆☆☆☆ | Aucun | Faible | `xxxx.trycloudflare.com/gun` |

## Peer list actuelle (main.js + stats.html)

```js
[
  "https://teamcel.on.shiper.app/gun",                             // ← relay principal (Shiper)
  "https://info-opportunities-particles-faculty.trycloudflare.com/gun", // ← tunnel de secours
  "https://gun.defucc.me/gun",
  "https://relay.peer.ooo/gun"
]
```

## Notes

- Le relay écoute sur `0.0.0.0:8765`
- Endpoint health check : `http://localhost:8765/health` (ou `https://xxxx.trycloudflare.com/health`)
- PM2 sauvegarde : `pm2 save` + `pm2 startup` (déjà fait)
- Pour voir les logs : `pm2 logs teamcel-relay` ou `pm2 logs cloudflared`
- Pour redémarrer le tunnel : `pm2 restart cloudflared`
