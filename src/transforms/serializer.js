var ProtoDef = require("protodef").ProtoDef;
var Serializer = require("protodef").Serializer;
var Parser = require("protodef").Parser;

var minecraft = require("../datatypes/minecraft");

function createProtocol(packets) {
  var proto = new ProtoDef();

  proto.addTypes(minecraft);
  proto.addTypes(packets);
  return proto;
}

function createSerializer(isServer = false) {
  var mcData = require("../../data/protocol");
  var direction = !isServer ? 'toServer' : 'toClient';
  var packets = mcData[direction].types;
  var proto = createProtocol(packets);
  return new Serializer(proto, "packet");
}

function createDeserializer(isServer = false) {
  var mcData = require("../../data/protocol");
  var direction = isServer ? "toServer" : "toClient";
  var packets = mcData[direction].types;
  var proto = createProtocol(packets);
  return new Parser(proto, "packet");
}

module.exports = {
  createSerializer: createSerializer,
  createDeserializer: createDeserializer
};