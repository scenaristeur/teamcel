var Gun = require('gun');

var server = require('http').createServer(function(req, res) {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
  }
});

// multicast: false -> disable UDP socket (233.255.255.255) which can crash in Docker containers.
// Peers are configured explicitly, so LAN discovery is not needed.
var gun = Gun({ web: server, multicast: false });
var PORT = process.env.PORT || 8765;
server.listen(PORT, '0.0.0.0', function() {
  console.log('GunDB relay on http://0.0.0.0:' + PORT + '/gun');
});

process.on('uncaughtException', function(err) {
  console.error('uncaughtException:', err);
});

process.on('unhandledRejection', function(err) {
  console.error('unhandledRejection:', err);
});
