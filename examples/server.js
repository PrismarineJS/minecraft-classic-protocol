var mc = require('../');

var options = { port: 25566 };
var server = mc.createServer(options);
var players = 0;


var zlib=require("zlib");

server.on('login', function(client) {
  players++;
  console.log("Someone connected!");
  var addr = client.socket.remoteAddress + ':' + client.socket.remotePort;

  client.on('end', function() {
    console.log("Someone left!");
    players--;
  });

  client.write('level_initialize', {});

  var map=new Buffer(4194308);
  map.fill(1);
  map.writeInt32BE(256*64*256,0);
  var compressedMap=zlib.gzipSync(map);

  for(var i=0;i<compressedMap.length;i+=1024) {
    client.write('level_data_chunk', {
      chunk_data: compressedMap.slice(i, Math.min(i + 1024, compressedMap.length)),
      percent_complete: i==0 ? 0 : Math.ceil(i/compressedMap.length * 100)
    });
  }

  client.write('level_finalize', {
    x_size: 256,
    y_size: 64,
    z_size: 256
  });

  client.write('spawn_player', {
    player_id: -1,
    player_name: client.username,
    x: 3184,
    y: 1392,
    z: 5712,
    yaw: 0,
    pitch: 0
  });


  client.write('message', {
    player_id: -1,
    message: client.username+' joined the game'
  });

});

server.on('error', function(error) {
  console.log('Oops! Something went wrong, ', error);
});

server.on('listening', function() {
  console.log('Server running on port', server.socketServer.address().port + "!");
});