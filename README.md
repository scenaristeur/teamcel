# TeamCel

> Chat anonyme pour les timides — sans profil, sans inscription.
> *Anonymous chat for shy people — no profile, no sign-up.*

TeamCel transforme un simple **QR code** en un salon de discussion anonyme, ouvert et bienveillant. Idéal pour les bars, les parcs, les files d'attente de concert, les événements ou n'importe quel lieu de vie : on scanne, on discute, on rencontre.

---

## Français

### C'est quoi ?

TeamCel est une **application web (PWA)** qui permet à un groupe de personnes d'échanger anonymement autour d'un même lieu. Un QR code affiché (porte, comptoir, table) ouvre un chat dédié à cet endroit. **Aucune inscription, aucun profil, aucun téléchargement d'app** : il suffit de scanner avec son téléphone.

Chaque lieu a sa propre **room** (salle de discussion) identifiée par le QR code qu'on imprimer.

### Comment ça marche

1. **Crée une room** et obtiens son URL + QR code en quelques secondes.
2. **Imprime le QR code** — au format A4 (porte), cartes de visite (comptoir), ou ticket 58mm (caisse).
3. **Les gens scannent** avec leur téléphone : un pseudo anonyne leur est attribué automatiquement et ils arrivent dans le chat.
4. **Ils discutent** sans donner leur nom ni leur numéro.

### Fonctionnalités

- **Anonymat** : un pseudo automatique (modifiable), aucun compte, aucun profil.
- **Vibe** : chacun peut afficher une petite étiquette (« timide, biere, sociable, guitariste, rebel, poete... ») à côté de son pseudo.
- **QR codes à imprimer** : A4, cartes de visite (16 par page), 58mm — impression directe depuis l'app, avec le nom de la room mis en avant.
- **Commander une impression** : envoi direct d'un e-mail de commande pré-rempli.
- **Partage** : URL copiée + partage natif du téléphone.
- **Thèmes** : plusieurs thèmes de couleurs.
- **Réponses** : appuie sur un message pour y répondre.
- **Stats** : page listant les rooms actives en temps réel.
- **PWA installable** : ajout à l'écran d'accueil, fonctionne en cache.
- **Mémorisation** : à la réouverture, on retrouve ta dernière room, ton dernier pseudo et ta vibe.
- **Internationalisation** : interface en français ou en anglais (auto-détection + bascule).
- **Frais de réseaux maitrisés** : les messages et homes inactives sont nettoyés automatiquement.

### Avantages

- **Zéro frottement** : pas d'app store, pas de compte, un scan et c'est parti.
- **Libérateur** : les personnes timides osent parler — crée de l'ambiance et fait revenir les clients.
- **Respectueux & bienveillant** : anonyme dès le départ, par défaut.
- **Gratuit et ouvert** : sans frais cachés, sans publicité.
- **Universel** : fonctionne sur tous les téléphones via le navigateur.

### Démarrage en local

```bash
npm install
npm run dev              # serveur statique sur http://localhost:4567
# ou, avec le relay GunDB en local :
npm run dev_with_relay   # relay + serveur
```

Puis ouvre `http://localhost:4567`.

### Architecture & synchronisation

- **Frontend** : une PWA statique (HTML/CSS/JS) hébergée sur GitHub Pages.
- **Base de données temps réel** : [GunDB](https://github.com/amark/gun), décentralisée, sans serveur d'application.
- **Relays** (points de synchronisation) : relay principal sur Belmo.io (Europe), avec des relays publics en secours et un VPS Hetzner auto-hébergé.
- **Service worker** : mise en cache + bannière « nouvelle version disponible ».

### Déploiement du relay

Voir [`DEPLOY_RELAY.md`](DEPLOY_RELAY.md) pour la gestion des relays GunDB.

### Licence

ISC.

---

## English

### What is it?

TeamCel is a **web application (PWA)** that lets a group of people chat anonymously around the same venue. A QR code posted at the door, bar or table opens a chat dedicated to that place. **No sign-up, no profile, no app download** — just scan with your phone.

Each venue has its own **room** identified by the QR code you print.

### How it works

1. **Create a room** and get its URL + QR code in seconds.
2. **Print the QR code** — A4 (door), business cards (bar counter), or 58mm ticket (cash register).
3. **People scan** with their phone: an anonymous pseudo is assigned automatically and they land in the chat.
4. **They chat** without sharing their name or number.

### Features

- **Anonymity**: automatic pseudo (editable), no account, no profile.
- **Vibe**: everyone can show a small tag («shy, beer, sociable, guitarist, rebel, poet...») next to their pseudo.
- **Printable QR codes**: A4, business cards (16 per page), 58mm — direct printing from the app, with the room name highlighted.
- **Order printing**: sends a pre-filled order email in one tap.
- **Sharing**: copied URL + native share sheet.
- **Themes**: several color themes.
- **Replies**: tap a message to reply to it.
- **Stats**: a page listing active rooms in real time.
- **Installable PWA**: add to home screen, works from cache.
- **Remembers you**: on reopen, your last room, pseudo and vibe are restored.
- **i18n**: French or English interface (auto-detected + toggle).
- **Self-cleanup**: stale messages and inactive rooms are removed automatically.

### Advantages

- **Zero friction**: no app store, no account, one scan and you're in.
- **Liberating**: shy people dare to speak up — creates atmosphere and brings customers back.
- **Respectful & friendly**: anonymous from the start, by default.
- **Free & open**: no hidden fees, no ads.
- **Universal**: works on every phone straight from the browser.

### Run locally

```bash
npm install
npm run dev              # static server at http://localhost:4567
# or, with a local GunDB relay:
npm run dev_with_relay   # relay + server
```

Then open `http://localhost:4567`.

### Architecture & sync

- **Frontend**: a static PWA (HTML/CSS/JS) hosted on GitHub Pages.
- **Realtime database**: [GunDB](https://github.com/amark/gun), decentralized, no app server.
- **Relays** (sync points): primary relay on Belmo.io (Europe), plus public fallback relays and a self-hosted Hetzner VPS.
- **Service worker**: caching + a “new version available” banner.

### Relay deployment

See [`DEPLOY_RELAY.md`](DEPLOY_RELAY.md) for managing the GunDB relays.

### License

ISC.
