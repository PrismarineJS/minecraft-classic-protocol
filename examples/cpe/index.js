var mc = require('../../');
var cpe = require('minecraft-classic-protocol-extension');

if (process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage: node echo.js <host> <port> [<name>]');
  process.exit(1);
}

var client = mc.createClient({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'echo',
  customPackets: cpe.protocol
});

client.on('connect', function () {
  console.info('connected');
  client.deserializer.write(new Buffer('1200A0', 'hex'));
});

client.on('disconnect', function (packet) {
  console.log('disconnected: ' + packet.reason);
});

client.on('end', function (err) {
  console.log('Connection lost');
});

client.on('set_click_distance', function (packet) {
  console.log(packet);
});
