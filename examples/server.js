var mc = require('../../');

var options = { port: 25565 };
var server = mc.createServer(options);
var players = 0;

server.on('login', function(client) {
  players++;
  console.log("Someone connected!");
  var addr = client.socket.remoteAddress + ':' + client.socket.remotePort;

  client.on('end', function() {
    console.log("Someone left!");
  });

  client.write('level_initalize', { });
  client.write('level_data_chunk', {
    chunk_length: 0,
    chunk_data: 0,
    percent_complete: 100
  });

  client.write('level_finalize', {
    x_size: 10,
    y_size: 10,
    z_size: 10
  });

  client.write('spawn_player', {
    player_id: players;
    player_name: "player" + players;
    x: 0,
    y: 0,
    z: 0,
    yaw: 0,
    pitch: 0
  });

});

server.on('error', function(error) {
  console.log('Oops! Something went wrong, ', error);
});

server.on('listening', function() {
  console.log('Server running! ', server.socketServer.address().port);
});