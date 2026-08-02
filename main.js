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

        // Periodic cleanup of stale rooms (every 30 min)
        var self = this;
        if (this._cleanupTimer) clearInterval(this._cleanupTimer);
        this._cleanupTimer = setInterval(function() {
            self._cleanupStaleRooms();
        }, 30 * 60 * 1000);
        setTimeout(function() { self._cleanupStaleRooms(); }, 5000);
    },

    connectToRoom(roomId) {
        if (this.roomRef) {
            this.roomRef.off();
        }
        // Stop previous timers
        if (this._heartbeatTimer) {
            clearInterval(this._heartbeatTimer);
        }
        if (this._cleanupTimer) {
            clearInterval(this._cleanupTimer);
        }
        this.settings.room = roomId;
        this.settings.processedMessages.clear();
        this._localSeq = 0;
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
            if (!data) return;
            if (!data.seq || !data.timestamp) return;
            if (self.settings.processedMessages.has(data.seq)) return;
            self.settings.processedMessages.add(data.seq);

            if (data.timestamp > (Date.now() - 1000 * 60 * 60)) {
                _queueEvent('chattable-message', {
                    text: data.text,
                    name: data.name,
                    flair: data.flair,
                    timestamp: data.timestamp,
                    id: data.seq,
                    replyTo: data.replyTo || null
                });
            }
        });
    },

    _cleanupStaleRooms() {
        var self = this;
        var currentRoom = this.settings.room;
        var threshold = Date.now() - 24 * 60 * 60 * 1000;

        this.gun.get('teamcel-registry').map().once(function(val, roomId) {
            if (!val || roomId === currentRoom) return;

            var latest = 0;
            var done = false;
            self.gun.get('teamcel-presence').get(roomId).map().once(function(userData) {
                if (done) return;
                if (userData && userData.timestamp && userData.timestamp > latest) {
                    latest = userData.timestamp;
                }
            });

            setTimeout(function() {
                done = true;
                if (latest < threshold) {
                    console.log('[cleanup] room stale:', roomId, 'last activity:', new Date(latest).toISOString());
                    self.gun.get('teamcel-registry').get(roomId).put(null);
                    self.gun.get('teamcel').get(roomId).put(null);
                    self.gun.get('teamcel-presence').get(roomId).put(null);
                }
            }, 3000);
        });
    },

    sendMessage(text, replyTo) {
        if (!text || typeof text !== 'string') return;

        var self = this;
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

        var roomMsgs = this.roomRef.get('messages');
        var entries = [];
        roomMsgs.map().once(function(v, k) {
            if (v && v.timestamp) entries.push({ id: k, ts: v.timestamp });
        });
        setTimeout(function() {
            if (entries.length >= self.MSG_LIMIT) {
                entries.sort(function(a, b) { return a.ts - b.ts; });
                var toRemove = entries.slice(0, entries.length - self.MSG_LIMIT + 1);
                for (var i = 0; i < toRemove.length; i++) {
                    roomMsgs.get(toRemove[i].id).put(null);
                }
            }
            var key = Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 4);
            roomMsgs.get(key).put(data);
        }, 500);
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
