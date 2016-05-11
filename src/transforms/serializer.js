var ProtoDef = require("protodef").ProtoDef;
var Serializer = require("protodef").Serializer;
var Parser = require("protodef").Parser;

var minecraft = require("../datatypes/minecraft");


function recursiveAddTypes(protocol, protocolData, path) {
  if(protocolData === undefined)
    return

  if(protocolData.types)
    protocol.addTypes(protocolData.types);

  recursiveAddTypes(protocol,get(protocolData,path.shift()),path);
}

function createProtocol(packets) {
  var proto = new ProtoDef();

  proto.addTypes(minecraft);
  proto.addTypes(packets);
  return proto;
}

function createSerializer(isServer = false) {
  var mcData = require("minecraft-data")("0.30c").protocol;
  var direction = !isServer ? 'toServer' : 'toClient';
  var packets = mcData[direction].types;
  var proto = createProtocol(packets);
  recursiveAddTypes(proto, merge(mcData.protocol,get(customPackets,[mcData.version.majorVersion])),[state,direction]);
  return new Serializer(proto, "packet");
}

function createDeserializer(isServer = false) {
  var mcData = require("minecraft-data")("0.30c").protocol;
  var direction = isServer ? "toServer" : "toClient";
  var packets = mcData[direction].types;
  var proto = createProtocol(packets);
  recursiveAddTypes(proto,merge(mcData.protocol,get(customPackets,[mcData.version.majorVersion])),[state,direction]);
  return new Parser(proto, "packet");
}

module.exports = {
  createSerializer: createSerializer,
  createDeserializer: createDeserializer
};
