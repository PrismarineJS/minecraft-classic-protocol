var mc = require('../');

var options = { port: 25566 };
var server = mc.createServer(options);
var players = 0;

server.on('login', function(client) {
  players++;
  console.log("Someone connected!");
  var addr = client.socket.remoteAddress + ':' + client.socket.remotePort;

  client.on('end', function() {
    console.log("Someone left!");
    players--;
  });

  client.write('level_initialize', {});

  var map=[];
  for(var i=0;i<1020;i++) {
    map.push(1);
  }

  client.write('level_data_chunk', {
    chunk_data: map,
    percent_complete: 100
  });

  client.write('level_finalize', {
    x_size: 10,
    y_size: 10,
    z_size: 10
  });

  client.write('player_teleport',{
    player_id:players,
    x:0,
    y:0,
    z:0,
    yaw:0,
    pitch:0
  });

  client.write('spawn_player', {
    player_id: players,
    player_name: "player" + players,
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
  console.log('Server running on port', server.socketServer.address().port + "!");
});