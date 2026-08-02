// Configuration partagée des relays GunDB (utilisée par main.js et stats.html)
var TeamCelPeers = (function() {
    var localRelay = 'http://localhost:8765/gun';
    var isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    var relayPeers = [
        'https://teamcel-relay-809f.onbelmo.uk/gun',
        'https://gun.defucc.me/gun',
        'https://relay.peer.ooo/gun'
    ];

    function defaults() {
        return (isLocal ? [localRelay] : []).concat(relayPeers.slice());
    }

    function withCustom(custom) {
        var peers = defaults();
        if (typeof custom === 'string') {
            try { custom = JSON.parse(custom); }
            catch (e) { custom = custom.split(',').map(function(p) { return p.trim(); }); }
        }
        if (Array.isArray(custom)) {
            peers = Array.from(new Set(peers.concat(custom)));
        }
        return peers;
    }

    return {
        defaults: defaults,
        withCustom: withCustom
    };
})();
