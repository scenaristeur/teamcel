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
    MSG_LIMIT: 100,
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

        const peers = TeamCelPeers.withCustom(parameters?.peers);

        this.gun = Gun({ peers: peers });

        // Generate or restore pseudo (fixed per session)
        this.user.name = sessionStorage.getItem('teamcel-pseudo') || this._generatePseudo();
        sessionStorage.setItem('teamcel-pseudo', this.user.name);

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
        this._slotMap = {};
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

        var _msgBatch = [];
        var _batchTimer = null;
        var _flushBatch = function() {
            _batchTimer = null;
            for (var i = 0; i < _msgBatch.length; i++) {
                window.dispatchEvent(_msgBatch[i]);
            }
            _msgBatch = [];
        };
        var _queueEvent = function(type, detail) {
            _msgBatch.push(new CustomEvent(type, { detail: detail }));
            if (!_batchTimer) {
                _batchTimer = requestAnimationFrame(_flushBatch);
            }
        };

        this.roomRef.get('messages').map().on((data, id) => {
            if (!data || !data.seq) return;

            var oldSeq = this._slotMap[id];
            this._slotMap[id] = data.seq;
            if (oldSeq && oldSeq !== data.seq) {
                _queueEvent('chattable-message-deleted', { id: oldSeq });
            }

            if (this.settings.processedMessages.has(data.seq)) return;
            this.settings.processedMessages.add(data.seq);

            if (data.timestamp > (Date.now() - 1000 * 60 * 60)) {
                _queueEvent('chattable-message', {
                    text: data.text,
                    name: data.name,
                    flair: data.flair,
                    timestamp: data.timestamp,
                    id: data.seq
                });
            } else if (!data) {
                _queueEvent('chattable-message-deleted', { id: id });
            }
        });
    },

    sendMessage(text) {
        if (!text || typeof text !== 'string') return;

        var self = this;
        this.roomRef.get('_msgSeq').once(function(n) {
            n = (n || 0) + 1;
            var slot = String((n - 1) % self.MSG_LIMIT);
            self.roomRef.get('_msgSeq').put(n);
            self.roomRef.get('messages').get(slot).put({
                text: text,
                name: self.user.name,
                flair: self.user.flair || '',
                timestamp: Date.now(),
                seq: n
            });
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
