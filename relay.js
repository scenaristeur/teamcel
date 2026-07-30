var Gun = require('gun');

var server = require('http').createServer(function(req, res) {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
  }
});

var gun = Gun({ web: server });
var PORT = process.env.PORT || 8765;
server.listen(PORT, '0.0.0.0', function() {
  console.log('GunDB relay on http://0.0.0.0:' + PORT + '/gun');
});
