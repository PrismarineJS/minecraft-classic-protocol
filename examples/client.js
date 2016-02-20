var mc = require('../');

if(process.argv.length < 4 || process.argv.length > 6) {
  console.log("Usage : node echo.js <host> <port> [<name>]");
  process.exit(1);
}

var client = mc.createClient({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : "echo",
  password: process.argv[5]
});

client.on('connect', function() {
  console.info('connected');
});

var map=new Buffer(0);
var zlib=require("zlib");


client.on('level_data_chunk',function(data) {
  map=Buffer.concat([map,data.chunk_data]);
});

client.on('level_finalize',function() {
  console.log(zlib.gunzipSync(map))
});
