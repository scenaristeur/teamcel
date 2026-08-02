var Gun = require('gun');
var fs = require('fs');
var path = require('path');

var server = require('http').createServer(function(req, res) {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
  }
});

var dataDir = process.env.GUN_DATA_DIR;
if (!dataDir) {
  dataDir = path.join(__dirname, 'radata');
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    var probe = path.join(dataDir, '.write-test');
    fs.writeFileSync(probe, 'ok');
    fs.unlinkSync(probe);
  } catch (e) {
    dataDir = path.join(require('os').tmpdir(), 'teamcel-radata');
    try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e2) {}
  }
}

// multicast: false -> disable UDP socket (233.255.255.255) which can crash in Docker containers.
// Peers are configured explicitly, so LAN discovery is not needed.
var gun = Gun({ web: server, multicast: false, file: dataDir, stats: false });
console.log('GunDB data dir:', dataDir);
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
