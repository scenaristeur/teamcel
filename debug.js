var Gun = require('gun');

var peers = [
    "https://gun.defucc.me/gun",
    "https://relay.peer.ooo/gun",
    "https://shogun-relay.scobrudot.dev/gun"
];

console.log('Connecting to relays:', peers);
var gun = Gun({ peers: peers });
var roomId = process.argv[2];

if (!roomId) {
    console.log('Usage: node debug.js <roomId>');
    process.exit(1);
}

console.log('=== Watching room:', roomId, '===');
console.log('Checking BOTH iframe-chat and teamcel paths...\n');

var paths = ['iframe-chat', 'teamcel'];

paths.forEach(function(base) {
    var room = gun.get(base).get(roomId);
    var count = 0;

    room.get('messages').map().on(function(data, id) {
        if (!data) return;
        count++;
        var age = Math.round((Date.now() - data.timestamp) / 1000);
        console.log('[' + base + '] #' + count + ' ' + new Date(data.timestamp).toLocaleTimeString()
            + ' | ' + (data.name || '?') + ': ' + (data.text || '')
            + ' | age=' + age + 's | id=' + id);
    });

    // After 3s, report if nothing received
    setTimeout(function() {
        if (count === 0) {
            console.log('[' + base + '] Nothing received yet (listening...)');
        } else {
            console.log('[' + base + '] Total: ' + count + ' messages\n');
        }
    }, 3000);
});

process.on('SIGINT', function() {
    console.log('\nStopped.');
    process.exit();
});
