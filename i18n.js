// Internationalization FR/EN for TeamCel.
// Default: French if the browser is in French, otherwise English.
// Overridable via localStorage['teamcel-lang'] + a toggle button.
// Loaded on index.html, stats.html, presentation.html before other scripts.
var I18N = (function() {

    var STORAGE_KEY = 'teamcel-lang';

    var DICT = {
        // ===== Landing =====
        'landing.tagline': {
            fr: 'Chat anonyme pour les timides.<br>Entre dans une room, discute, rencontre.',
            en: 'Anonymous chat for the shy.<br>Join a room, chat, meet people.'
        },
        'landing.roomPlaceholder': { fr: 'Nom de la room...', en: 'Room name...' },
        'landing.go': { fr: 'Entrer', en: 'Enter' },
        'landing.recentTitle': { fr: 'Mes dernières rooms', en: 'My recent rooms' },
        'landing.theme': { fr: 'Thème', en: 'Theme' },
        'landing.stats': { fr: 'Stats des rooms', en: 'Rooms stats' },
        'landing.about': { fr: 'En savoir plus sur TeamCel', en: 'More about TeamCel' },
        'switchLang': { fr: 'English', en: 'Français' },
        'install': { fr: 'Installer', en: 'Install' },

        // ===== Chat =====
        'chat.flairLabel': { fr: 'ton vibe :', en: 'your vibe:' },
        'chat.flairPlaceholder': { fr: 'timide, biere, sociable, guitariste, rebel, poete...', en: 'shy, beer, sociable, guitarist, rebel, poet...' },
        'chat.msgPlaceholder': { fr: 'Ecrire un message...', en: 'Type a message...' },
        'chat.sendAria': { fr: 'Envoyer', en: 'Send' },
        'chat.shareTitle': { fr: 'Partager', en: 'Share' },
        'chat.themeTitle': { fr: 'Changer de thème', en: 'Change theme' },
        'chat.replyToPrefix': { fr: 'Répond à', en: 'Replying to' },
        'chat.replyCancelAria': { fr: 'Annuler la réponse', en: 'Cancel reply' },

        // ===== Pseudo toast =====
        'pseudo.title': { fr: 'Tu es', en: 'You are' },
        'pseudo.enter': { fr: 'Entrer dans le chat', en: 'Enter the chat' },

        // ===== Share modal =====
        'share.title': { fr: 'Partager cette room', en: 'Share this room' },
        'share.clipboardInfo': {
            fr: "L'URL a ete copiee dans le presse-papier. Colle-la avec <b>Ctrl+V</b> dans n'importe quelle appli pour la partager !",
            en: "The URL has been copied to your clipboard. Paste it with <b>Ctrl+V</b> in any app to share it!"
        },
        'share.closeAria': { fr: 'Fermer', en: 'Close' },
        'share.native': { fr: 'Partager', en: 'Share' },
        'share.sectionPrint': { fr: 'Imprimer', en: 'Print' },
        'share.printA4': { fr: 'A4', en: 'A4' },
        'share.printCard': { fr: 'Carte', en: 'Card' },
        'share.printMini': { fr: '58mm', en: '58mm' },
        'share.sectionOrder': { fr: 'Commander une impression', en: 'Order printing' },
        'share.orderMail': { fr: 'Par mail', en: 'By email' },

        // ===== Share order mail =====
        'share.orderSubject': { fr: "Commande d'impressions pour Teamcel", en: 'TeamCel printing order' },
        'share.orderBodyIntro': {
            fr: "Bonjour, je souhaiterais connaitre les modalités pour pouvoir faire imprimer les QRCodes Teamcel pour un lieu/événement.\n\nVoici ce qu'il me faudrait :",
            en: "Hello, I would like to know how to get TeamCel QR codes printed for a venue/event.\n\nHere is what I need:"
        },
        'share.orderA4': { fr: '- impressions A4 :', en: '- A4 prints:' },
        'share.orderCard': { fr: '- cartes :', en: '- cards:' },
        'share.orderMini': { fr: '- 58mm :', en: '- 58mm:' },
        'share.orderStickers': { fr: '- autocollants :', en: '- stickers:' },
        'share.orderOther': { fr: '- autres (tableau grand format, peinture murale...) :', en: '- other (large format board, wall painting...):' },
        'share.orderRoom': { fr: '\nRoom :', en: '\nRoom:' },

        // ===== Theme dropdown =====
        'theme.title': { fr: 'Changer de thème', en: 'Change theme' },

        // ===== Print =====
        'print.title': { fr: 'TeamCel', en: 'TeamCel' },
        'print.subtitle': { fr: 'Le chat anonyme', en: 'The anonymous chat' },
        'print.slogan': { fr: 'Scan, Discute, Rencontre', en: 'Scan, Chat, Meet' },
        'print.a4Steps': {
            fr: "TeamCel | Le chat anonyme",
            en: 'TeamCel | The anonymous chat'
        },
        'print.a4FooterTag': { fr: 'Chat anonyme - sans inscription - bienveillant', en: 'Anonymous chat - no sign-up - friendly' },
        'print.miniFooter': { fr: 'chat anonyme', en: 'anonymous chat' },

        // ===== Update banner =====
        'update.text': { fr: 'Nouvelle version disponible', en: 'New version available' },
        'update.reload': { fr: 'Recharger', en: 'Reload' },

        // ===== Stats =====
        'stats.pageTitle': { fr: 'Stats - TeamCel', en: 'Stats - TeamCel' },
        'stats.badge': { fr: 'stats', en: 'stats' },
        'stats.back': { fr: '← Chat', en: '← Chat' },
        'stats.activeRooms': { fr: 'Rooms actives', en: 'Active rooms' },
        'stats.searching': { fr: 'Recherche en cours...', en: 'Searching...' },
        'stats.refresh': { fr: 'Rafraîchir', en: 'Refresh' },
        'stats.connected': { fr: 'Connecté aux relays GunDB', en: 'Connected to GunDB relays' },
        'stats.live': { fr: 'Mise à jour en temps réel', en: 'Real-time updates' },
        'stats.refreshedAt': { fr: 'Rafraîchi à', en: 'Refreshed at' },
        'stats.loadingTitle': { fr: 'Chargement en cours...', en: 'Loading...' },
        'stats.loadingBody': { fr: 'Recherche des rooms actives sur les relays...', en: 'Looking for active rooms on the relays...' },
        'stats.emptyTitle': { fr: 'Aucune room active', en: 'No active room' },
        'stats.emptyBody': {
            fr: 'Les rooms apparaissent ici quand des utilisateurs sont présents.<br>Ouvre TeamCel et crée ou rejoins une room pour commencer.',
            en: 'Rooms appear here when users are present.<br>Open TeamCel and create or join a room to get started.'
        },
        'stats.rooms': { one: { fr: 'room', en: 'room' }, other: { fr: 'rooms', en: 'rooms' } },
        'stats.users': { one: { fr: 'utilisateur', en: 'user' }, other: { fr: 'utilisateurs', en: 'users' } },
        'stats.lastActivity': { fr: 'Dernière activité', en: 'Last activity' },

        // ===== Presentation =====
        'presentation.title': { fr: 'TeamCel — Chat anonyme pour les bars', en: 'TeamCel — Anonymous chat for bars' },
        'presentation.heroTitle': { fr: 'Le chat anonyme <span>pour les bars</span>', en: 'The anonymous chat <span>for bars</span>' },
        'presentation.heroText': {
            fr: 'Un QR code sur la porte ou la table. Tes clients scannent, discutent. Sans inscription, sans app, sans modération.',
            en: 'A QR code on the door or the table. Your customers scan and chat. No sign-up, no app, no moderation.'
        },
        'presentation.heroCta': { fr: 'Essayer TeamCel →', en: 'Try TeamCel →' },
        'presentation.howTitle': { fr: 'Comment ça <span>marche</span>', en: 'How it <span>works</span>' },
        'presentation.step1Title': { fr: 'Imprime le QR code', en: 'Print the QR code' },
        'presentation.step1Text': {
            fr: 'Génère un QR code pour ta room et imprime-le en A4, carte de visite ou ticket 58mm.',
            en: 'Generate a QR code for your room and print it on A4, business cards or 58mm tickets.'
        },
        'presentation.step2Title': { fr: 'Colle-le à l\'entrée', en: 'Stick it at the entrance' },
        'presentation.step2Text': {
            fr: 'Les clients scannent avec leur téléphone. Pas de téléchargement, pas de compte.',
            en: 'Customers scan with their phone. No download, no account.'
        },
        'presentation.step3Title': { fr: 'Ils discutent', en: 'They chat' },
        'presentation.step3Text': {
            fr: 'Un pseudo leur est attribué. Ils peuvent échanger sans donner leur nom ni leur numéro.',
            en: 'A pseudo is assigned to them. They can exchange without giving their name or number.'
        },
        'presentation.barsTitle': { fr: 'Pour les bars, les parcs, les files d\'attente de concert', en: 'For bars, parks, concert lines' },
        'presentation.benefit1Title': { fr: '<span>+</span> De lien social', en: '<span>+</span> Social connection' },
        'presentation.benefit1Text': {
            fr: 'Les clients timides osent parler. Ça crée de l\'ambiance et ça les fait revenir.',
            en: 'Shy customers dare to speak up. It creates atmosphere and brings them back.'
        },
        'presentation.benefit2Title': { fr: '<span>⚡</span> Instantané, zéro installation', en: '<span>⚡</span> Instant, zero install' },
        'presentation.benefit2Text': {
            fr: 'Pas d\'app store, pas de compte. Un scan et c\'est parti. Ça marche sur tous les téléphones.',
            en: 'No app store, no account. A scan and you\'re in. It works on every phone.'
        },
        'presentation.benefit3Title': { fr: '<span>🖨️</span> QR code prêt à imprimer', en: '<span>🖨️</span> QR code ready to print' },
        'presentation.benefit3Text': {
            fr: '3 formats : A4 (porte), cartes de visite (comptoir), 58mm (caisse). Impression directe depuis l\'app.',
            en: '3 formats: A4 (door), business cards (bar), 58mm (cash register). Print directly from the app.'
        },
        'presentation.benefit4Title': { fr: '<span>🔒</span> Anonyme et bienveillant', en: '<span>🔒</span> Anonymous and friendly' },
        'presentation.benefit4Text': {
            fr: 'Pas de modération nécessaire. Les messages disparaissent au bout d\'une heure. Parfait pour un public décontracté.',
            en: 'No moderation needed. Messages disappear after an hour. Perfect for a relaxed crowd.'
        },
        'presentation.formatsTitle': { fr: 'Formats <span>d\'impression</span>', en: 'Print <span>formats</span>' },
        'presentation.formatA4': { fr: 'Pour la porte d\'entrée', en: 'For the front door' },
        'presentation.formatCard': { fr: '8 par page, pour le comptoir', en: '8 per page, for the counter' },
        'presentation.formatMini': { fr: 'Pour imprimante thermique', en: 'For thermal printer' },
        'presentation.tagTitle': { fr: 'TeamCel, c\'est gratuit', en: 'TeamCel is free' },
        'presentation.tagText': {
            fr: 'Pas de frais cachés. Pas de pub. Juste un outil pour mieux rencontrer les gens autour d\'un verre.',
            en: 'No hidden fees. No ads. Just a tool to meet people over a drink.'
        },
        'presentation.tryTitle': { fr: 'Essaie <span>maintenant</span>', en: 'Try it <span>now</span>' },
        'presentation.tryText': {
            fr: 'Crée ta room et obtiens le QR code à imprimer en quelques secondes.',
            en: 'Create your room and get the QR code to print in seconds.'
        },
        'presentation.demoPlaceholder': { fr: 'Nom de la room...', en: 'Room name...' },
        'presentation.demoGo': { fr: 'C\'est parti', en: "Let's go" },
        'presentation.supportTitle': { fr: 'Soutenir <span>TeamCel</span>', en: 'Support <span>TeamCel</span>' },
        'presentation.supportBoxTitle': { fr: 'TeamCel a besoin de toi', en: 'TeamCel needs you' },
        'presentation.supportText': {
            fr: 'Le relay GunDB tourne sur un serveur, le domaine et le tunnel Cloudflare ont un coût. Si tu utilises TeamCel dans ton bar et que tu veux soutenir le projet, un petit coup de main est le bienvenu.',
            en: 'The GunDB relay runs on a server, the domain and Cloudflare tunnel have a cost. If you use TeamCel in your bar and want to support the project, a little help is welcome.'
        },
        'presentation.supportBtn': { fr: 'Nous soutenir →', en: 'Support us →' },
        'presentation.footerTag': { fr: 'TeamCel — anonyme, gratuit, ouvert', en: 'TeamCel — anonymous, free, open' },
        'presentation.demoRoomLink': { fr: 'Room de démo', en: 'Demo room' }
    };

    function detect() {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'fr' || stored === 'en') return stored;
        var nav = (navigator.language || navigator.languages && navigator.languages[0] || '').toLowerCase();
        return nav.indexOf('fr') === 0 ? 'fr' : 'en';
    }

    var current = detect();

    function $pick(obj) {
        if (!obj) return '';
        return typeof obj === 'string' ? obj : (obj[current] !== undefined ? obj[current] : (obj.en !== undefined ? obj.en : ''));
    }

    function plural(key, n) {
        var rule = DICT[key];
        var form = (n === 0 || n === 1) ? 'one' : 'other';
        var obj = rule ? rule[form] : null;
        return $pick(obj);
    }

    function t(key, vars) {
        var str = $pick(DICT[key]);
        if (vars) {
            str = str.replace(/{(.+?)}/g, function(m, k) {
                return vars[k] !== undefined ? vars[k] : m;
            });
        }
        return str;
    }

    function translateElement(el) {
        var isHTML = el.hasAttribute('data-i18n-html');
        var key = isHTML ? el.getAttribute('data-i18n-html') : el.getAttribute('data-i18n');
        if (key && key !== t(key)) {
            if (isHTML) el.innerHTML = t(key);
            else el.textContent = t(key);
        }
        var ph = el.getAttribute('data-i18n-ph');
        if (ph) el.setAttribute('placeholder', t(ph));
        var title = el.getAttribute('data-i18n-title');
        if (title) el.setAttribute('title', t(title));
        var aria = el.getAttribute('data-i18n-aria');
        if (aria) el.setAttribute('aria-label', t(aria));
    }

    function apply(root) {
        root = root || document;
        var nodes = root.querySelectorAll('[data-i18n],[data-i18n-html],[data-i18n-ph],[data-i18n-title],[data-i18n-aria]');
        for (var i = 0; i < nodes.length; i++) translateElement(nodes[i]);
        var title = root.querySelector('title');
        if (title) {
            var tKey = title.getAttribute('data-i18n');
            if (tKey && DICT[tKey]) title.textContent = $pick(DICT[tKey]);
        }
        document.documentElement.setAttribute('lang', current);
    }

    function setLang(lang) {
        localStorage.setItem(STORAGE_KEY, lang);
        document.dispatchEvent(new CustomEvent('teamcel-langchange', { detail: { lang: lang } }));
        window.location.reload();
    }

    function getLang() { return current; }
    function isFr() { return current === 'fr'; }

    function init() {
        apply(document);
        var toggles = document.querySelectorAll('[data-i18n-toggle]');
        for (var i = 0; i < toggles.length; i++) {
            toggles[i].textContent = t('switchLang');
            toggles[i].addEventListener('click', function() {
                setLang(current === 'fr' ? 'en' : 'fr');
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        t: t,
        plural: plural,
        apply: apply,
        init: init,
        setLang: setLang,
        getLang: getLang,
        isFr: isFr
    };
})();

window.I18N = I18N;
