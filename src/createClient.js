var net = require('net');
var dns = require('dns');
var Client = require('./client');
var assert = require('assert');

module.exports=createClient;

Client.prototype.connect = function(port, host) {
  var self = this;
  if(port == 25565 && net.isIP(host) === 0) {
    dns.resolveSrv("_minecraft._tcp." + host, function(err, addresses) {
      if(addresses && addresses.length > 0) {
        self.setSocket(net.connect(addresses[0].port, addresses[0].name));
      } else {
        self.setSocket(net.connect(port, host));
      }
    });
  } else {
    self.setSocket(net.connect(port, host));
  }
};

function createClient(options) {
  assert.ok(options, "options is required");
  var port = options.port || 25565;
  var host = options.host || 'localhost';

  assert.ok(options.username, "username is required");


  var client = new Client(false);
  client.on('connect', onConnect);
  client.username = options.username;
  client.connect(port, host);
  function onConnect() {
    client.write('player_identification', {
      protocol_version: 0x07,
      username: client.username,
      verification_key:"",
      unused:0x00
    });
  }

  return client;
}
