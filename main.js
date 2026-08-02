var chattable = {
    user: {
        flair: localStorage.flair || null,
        name: null,
        pub: null
    },
    loaded: false,
    _localSeq: 0,
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
        this._localSeq = 0;
        this._keyToSeq = {};
        this._seqToKey = {};
        this._msgTimestamps = {};
        this._pruneTimer = null;
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

        var self = this;
        this.roomRef.get('messages').map().on((data, gunId) => {
            if (!data) {
                var seq = self._keyToSeq[gunId];
                if (seq) {
                    delete self._keyToSeq[gunId];
                    delete self._seqToKey[seq];
                    delete self._msgTimestamps[seq];
                    _queueEvent('chattable-message-deleted', { id: seq });
                }
                return;
            }
            if (!data.seq) return;

            self._keyToSeq[gunId] = data.seq;
            self._seqToKey[data.seq] = gunId;

            if (self.settings.processedMessages.has(data.seq)) return;
            self.settings.processedMessages.add(data.seq);

            if (data.timestamp) {
                self._msgTimestamps[data.seq] = data.timestamp;
            }

            if (data.timestamp && data.timestamp > (Date.now() - 1000 * 60 * 60)) {
                _queueEvent('chattable-message', {
                    text: data.text,
                    name: data.name,
                    flair: data.flair,
                    timestamp: data.timestamp,
                    id: data.seq,
                    replyTo: data.replyTo || null
                });
            }

            self._schedulePrune();
        });
    },

    _schedulePrune() {
        if (this._pruneTimer) clearTimeout(this._pruneTimer);
        var self = this;
        this._pruneTimer = setTimeout(function() {
            self._pruneTimer = null;
            self._pruneMessages();
        }, 2000);
    },

    _pruneMessages() {
        var ids = Object.keys(this._msgTimestamps);
        if (ids.length <= this.MSG_LIMIT) return;
        var self = this;
        ids.sort(function(a, b) {
            return (self._msgTimestamps[a] || 0) - (self._msgTimestamps[b] || 0);
        });
        var toRemove = ids.slice(0, ids.length - this.MSG_LIMIT);
        for (var i = 0; i < toRemove.length; i++) {
            var seq = toRemove[i];
            var gunKey = this._seqToKey[seq];
            if (gunKey) {
                this.roomRef.get('messages').get(gunKey).put(null);
            }
        }
    },

    sendMessage(text, replyTo) {
        if (!text || typeof text !== 'string') return;

        this._localSeq = (this._localSeq || 0) + 1;
        var data = {
            text: text,
            name: this.user.name,
            flair: this.user.flair || '',
            timestamp: Date.now(),
            seq: this.user.name + '-' + this._localSeq
        };
        if (replyTo && replyTo.id) {
            data.replyTo = JSON.stringify({ id: replyTo.id, name: replyTo.name, text: replyTo.text });
        }
        this.roomRef.get('messages').set(data);
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
