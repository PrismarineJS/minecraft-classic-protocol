var ProtoDef = require("protodef").ProtoDef;
var Serializer = require("protodef").Serializer;
var Parser = require("protodef").Parser;

var minecraft = require("../datatypes/minecraft");

function createProtocol(packets) {
  var proto = new ProtoDef();

  Object.keys(packets).forEach(function (name) {
    proto.addType("packet_" + name, ["container", packets[name].fields]);
  });

  proto.addType("packet", ["container", [{
    "name": "name",
    "type": ["mapper", {
      "type": "varint",
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