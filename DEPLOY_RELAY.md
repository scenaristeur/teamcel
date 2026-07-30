# Déploiement du relay GunDB

## Architecture

```
Utilisateur → GitHub Pages (HTTPS)
                ↓
          Cloudflare Tunnel (HTTPS)
                ↓
          Hetzner VPS :8765 (relay.js)
                ↓
          GunDB peers (fallbacks)
```

- **Frontend** : GitHub Pages (`scenaristeur.github.io/teamcel`)
- **Relay** : Hetzner VPS, Node.js + GunDB
- **Tunnel HTTPS** : Cloudflare `trycloudflare.com` (pas de certbot nécessaire)
- **Fallbacks** : `gun.defucc.me`, `relay.peer.ooo`

## Pourquoi pas de reverse proxy Nginx ?

Le port 80/443 est occupé par Discourse (Docker). Solution : Cloudflare Tunnel qui gère le HTTPS automatiquement sans toucher à Nginx.

## Installation

```bash
# 1. Installer PM2
npm install -g pm2

# 2. Créer le dossier
mkdir -p /opt/teamcel-relay
cd /opt/teamcel-relay

# 3. Créer relay.js
cat > relay.js << 'EOF'
var Gun = require('gun');

var server = require('http').createServer(function(req, res) {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
  }
});

var gun = Gun({ web: server });
var PORT = process.env.PORT || 8765;
server.listen(PORT, '0.0.0.0', function() {
  console.log('GunDB relay on http://0.0.0.0:' + PORT + '/gun');
});
EOF

# 4. Installer GunDB
npm init -y
npm install gun

# 5. Lancer le relay avec PM2
pm2 start relay.js --name teamcel-relay
pm2 save

# 6. PM2 au démarrage
pm2 startup
systemctl enable pm2-root

# 7. Installer Cloudflare Tunnel
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O /usr/local/bin/cloudflared
chmod +x /usr/local/bin/cloudflared

# 8. Lancer le tunnel
pm2 start cloudflared -- tunnel --url http://localhost:8765
pm2 save

# 9. Récupérer l'URL générée
pm2 logs cloudflared
# → https://xxxx.trycloudflare.com
```

## Mise à jour du peer URL

Dans `main.js` et `stats.html` :

```js
// Avant
"https://relay.chateaudesrobots.fr/gun",

// Après (URL du tunnel)
"https://xxxx.trycloudflare.com/gun",
```

Pusher sur GitHub.

## Notes

- L'URL `trycloudflare.com` change après un redémarrage de cloudflared
- Pour une URL fixe : configurer un tunnel Cloudflare nommé avec `cloudflared tunnel create`
- Le domaine `relay.chateaudesrobots.fr` pourra être utilisé quand le DNS aura propagé (reverse proxy Nginx dans le container Discourse + certbot)
