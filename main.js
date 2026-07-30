var chattable = {
    user: {
        flair: localStorage.flair || null,
        name: null,
        pub: null
    },
    loaded: false,
    settings: {
        initialized: false,
        room: 'public',
        processedMessages: new Set()
    },
    gun: null,
    roomRef: null,

    _adjectives: [
        'Lapin', 'Ours', 'Renard', 'Chat', 'Hibou', 'Dauphin', 'Tigre', 'Aigle',
        'Loup', 'Panda', 'Koala', 'Pinguin', 'Guépard', 'Chouette', 'Baleine',
        'Poulpe', 'Zebre', 'Kangourou', 'Loutre', 'Furet', 'Singe', 'Paon',
        'Libellule', 'Papillon', 'Cigogne', 'Flamant', 'Tortue', 'Salamandre',
        'Alpaga', 'Lama', 'Vautour', 'Sanglier', 'Castor', 'Phoque', 'Orque',
        'Sardine', 'Thon', 'Bar', 'Perche', 'Brochet', 'Carpe', 'Truite',
        'Sole', 'Raie', 'Anguille', 'Morue', 'Maquereau', 'Anchois', 'Hareng'
    ],
    _nouns: [
        'Chanceux', 'Malin', 'Fou', 'Sage', 'Veloce', 'Fort', 'Petit', 'Grand',
        'Rapide', 'Lent', 'Brave', 'Gentil', 'Mystere', 'Eclatant', 'Solaire',
        'Polaire', 'Cosmique', 'Lunaire', 'Stellaire', 'Celeste', 'Terrestre',
        'Sauvage', 'Turbulent', 'Calme', 'Discret', 'Curieux', 'Joueur',
        'Reveur', 'Vagabond', 'Nomade', 'Pilote', 'Artiste', 'Poete', 'Rieur',
        'Chanteur', 'Danseur', 'Raclette', 'Fondue', 'Croissant', 'Baguette',
        'Crepe', 'Gauffre', 'Mousse', 'Sorbet', 'Nougat', 'Caramel', 'Menthe'
    ],

    _generatePseudo() {
        const adj = this._adjectives[Math.floor(Math.random() * this._adjectives.length)];
        const noun = this._nouns[Math.floor(Math.random() * this._nouns.length)];
        return adj + noun;
    },

    initialize(parameters) {
        if (typeof Gun === 'undefined') {
            console.error("GunDB not loaded");
            return;
        }

        const defaultPeers = [
            "https://shogun-relay.scobrudot.dev/gun",
            "https://sudorecords.scobrudot.dev/gun",
            "https://gun.defucc.me/gun",
            "https://gun.o8.is/gun"
        ];

        let peers = [...defaultPeers];
        if (parameters?.peers) {
            let customPeers = parameters.peers;
            if (typeof customPeers === 'string') {
                try { customPeers = JSON.parse(customPeers); }
                catch (e) { customPeers = customPeers.split(',').map(p => p.trim()); }
            }
            if (Array.isArray(customPeers)) {
                peers = [...new Set([...peers, ...customPeers])];
            }
        }

        this.gun = Gun({ peers: peers });

        // Generate or restore pseudo (fixed per session, no localStorage)
        this.user.name = this._generatePseudo();

        const roomId = parameters?.chat || 'public';
        this.connectToRoom(roomId);

        this.loaded = true;
        this.settings.initialized = true;

        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('chattable-ready'));
    },

    connectToRoom(roomId) {
        if (this.roomRef) {
            this.roomRef.off();
        }
        // Stop previous heartbeat
        if (this._heartbeatTimer) {
            clearInterval(this._heartbeatTimer);
        }
        this.settings.room = roomId;
        this.settings.processedMessages.clear();
        this.roomRef = this.gun.get('teamcel').get(roomId);

        // Register room in global registry (separate top-level key)
        this.gun.get('teamcel-registry').get(roomId).put(true);

        // Start presence heartbeat (separate top-level key)
        this._heartbeatTimer = setInterval(() => {
            if (this.user.name) {
                this.gun.get('teamcel-presence').get(roomId).get(this.user.name).put({
                    name: this.user.name,
                    timestamp: Date.now()
                });
            }
        }, 30000);
        // Write heartbeat immediately
        if (this.user.name) {
            this.gun.get('teamcel-presence').get(roomId).get(this.user.name).put({
                name: this.user.name,
                timestamp: Date.now()
            });
        }

        this.roomRef.get('messages').map().on((data, id) => {
            console.log('[GUN msg] id=' + id, JSON.stringify(data));
            if (this.settings.processedMessages.has(id)) {
                console.log('[GUN msg] SKIP already processed');
                return;
            }
            this.settings.processedMessages.add(id);

            if (data && data.timestamp > (Date.now() - 1000 * 60 * 60)) {
                window.dispatchEvent(new CustomEvent('chattable-message', {
                    detail: {
                        text: data.text,
                        name: data.name,
                        flair: data.flair,
                        timestamp: data.timestamp,
                        id: id
                    }
                }));
            }
        });
    },

    sendMessage(text) {
        if (!text || typeof text !== 'string') return;

        this.roomRef.get('messages').set({
            text: text,
            name: this.user.name,
            flair: this.user.flair || '',
            timestamp: Date.now()
        });
    },

    setFlair(string) {
        this.user.flair = string || null;
        if (string) localStorage.flair = string;
        else delete localStorage.flair;
    },

    changeRoom(chat_id) {
        this.connectToRoom(chat_id);
    },

    sendPayload(obj) {
        if (this.roomRef) {
            this.roomRef.get('payloads').set(JSON.stringify(obj));
        }
    }
};

window.chattable = chattable;
