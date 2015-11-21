var mcClassic=require("../");

var serializer=mcClassic.createSerializer(true);
var parser=mcClassic.createDeserializer(false);

serializer.write({
  name: "level_finalize",
  params: {
    "x_size": 1,
    "y_size": 1,
    "z_size": 1
  }
});

serializer.write({
  name: "server_identification",
  params: {
    "protocol_version": 0x07,
    "server_name": "test",
    "server_motd": "test",
    "user_type": "test"
  }
});

serializer.pipe(parser);

parser.on('data', function (chunk) {
  console.log(JSON.stringify(chunk, null, 2));
});