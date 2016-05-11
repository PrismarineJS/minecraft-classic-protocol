var websocket = require('websocket-stream');
var mc = require('../../index');

mc.Client.prototype.connect = function(port, host) {
  var self = this;
  if(port == 25565 && net.isIP(host) === 0) {
    dns.resolveSrv("_minecraft._tcp." + host, function(err, addresses) {
      if(addresses && addresses.length > 0) {
        self.setSocket(websocket('ws://' + addresses[0].name + ':' + addresses[0].port, ['binary']));
      } else {
        self.setSocket(websocket('ws://' + host + ':' + port, ['binary']));
      }
    });
  } else {
    self.setSocket(websocket('ws://' + host + ':' + port, ['binary']));
  }
}

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage: node echo.js <host> <port> [<name>]');
  process.exit(1);
}

var client = mc.createClient({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'echo',
  password: process.argv[5]
});

client.on('connect', function() {
  console.info('connected');
});
