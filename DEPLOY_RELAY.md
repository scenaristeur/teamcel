# Déploiement du relay GunDB sur le VPS Hetzner

## 1. Installer PM2 et préparer le dossier

```bash
npm install -g pm2
mkdir -p /opt/teamcel-relay
cd /opt/teamcel-relay
```

## 2. Créer relay.js

```bash
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
```

## 3. Installer GunDB

```bash
npm init -y
npm install gun
```

## 4. Tester

```bash
node relay.js
```

Dans un autre terminal SSH :
```bash
curl http://127.0.0.1:8765/gun
```

## 5. Lancer avec PM2

```bash
pm2 start relay.js --name teamcel-relay
pm2 save
pm2 startup   # exécute la commande affichée
```

## 6. Nginx — reverse proxy

```bash
nano /etc/nginx/sites-available/relay.chateaudesrobots.fr
```

```nginx
server {
    listen 80;
    server_name relay.chateaudesrobots.fr;

    location / {
        proxy_pass http://127.0.0.1:8765;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/relay.chateaudesrobots.fr /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## 7. SSL avec certbot

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d relay.chateaudesrobots.fr
```

## 8. Vérifier

```bash
curl https://relay.chateaudesrobots.fr/health
# → "ok"
curl https://relay.chateaudesrobots.fr/gun
```

## 9. Mettre à jour les peers

Après déploiement, le peer URL est `https://relay.chateaudesrobots.fr/gun`.

Il est déjà configuré dans `main.js` et `stats.html`. Il suffit de `git push` pour déployer sur GitHub Pages.
