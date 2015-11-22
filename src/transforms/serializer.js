var ProtoDef = require("protodef").ProtoDef;
var Serializer = require("protodef").Serializer;
var tryCatch=require('protodef').utils.tryCatch;
var Transform = require("readable-stream").Transform;

class Parser extends Transform {
  constructor(proto,mainType) {
    super({ readableObjectMode: true });
    this.proto=proto;
    this.mainType=mainType;
  }

  parsePacketBuffer(buffer) {
    return this.proto.parsePacketBuffer(this.mainType,buffer);
  }

  _transform(chunk, enc, cb) {
    try {
      var offset=0;
      while(true) {
        var r;
        try {
          r=this.proto.read(chunk, offset, this.mainType, {});
        }
        catch(e) {
          e.message=`Read error for ${e.field} : ${e.message}`;
          throw e;
        }
        var results={
          data: r.value,
          metadata:{
            size:r.size
          },
          buffer:chunk.slice(offset,r.size)
        };
        console.log(results);
        this.push(results);
        offset+=r.size;
        if(offset>=chunk.length) break;
      }

    } catch (e) {
      return cb(e);
    }
    return cb();
  }
}

var minecraft = require("../datatypes/minecraft");

function createProtocol(packets) {
  var proto = new ProtoDef();

  proto.addTypes(minecraft);

  Object.keys(packets).forEach(function (name) {
    proto.addType("packet_" + name, ["container", packets[name].fields]);
  });

  proto.addType("packet", ["container", [{
    "name": "name",
    "type": ["mapper", {
      "type": "ubyte",
      "mappings": Object.keys(packets).reduce(function (acc, name) {
        acc[parseInt(packets[name].id)] = name;
        return acc;
      }, {})
    }]
  }, {
    "name": "params",
    "type": ["switch", {
      "compareTo": "name",
      "fields": Object.keys(packets).reduce(function (acc, name) {
        acc[name] = "packet_" + name;
        return acc;
      }, {})
    }]
  }]]);
  return proto;
}

function createSerializer(isServer = false) {
  var mcData = require("../../data/protocol");
  var direction = !isServer ? 'toServer' : 'toClient';
  var packets = mcData[direction];
  var proto = createProtocol(packets);
  return new Serializer(proto, "packet");
}

function createDeserializer(isServer = false) {
  var mcData = require("../../data/protocol");
  var direction = isServer ? "toServer" : "toClient";
  var packets = mcData[direction];
  var proto = createProtocol(packets);
  return new Parser(proto, "packet");
}

module.exports = {
  createSerializer: createSerializer,
  createDeserializer: createDeserializer
};