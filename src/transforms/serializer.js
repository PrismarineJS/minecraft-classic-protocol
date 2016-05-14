var ProtoDef = require("protodef").ProtoDef;
var Serializer = require("protodef").Serializer;
var Parser = require("protodef").Parser;

var merge = require("lodash.merge");
var get = require("lodash.get");

var minecraft = require("../datatypes/minecraft");


function recursiveAddTypes(protocol, protocolData, path) {
  if(protocolData === undefined)
    return;

  if(protocolData.types)
    protocol.addTypes(protocolData.types);

  recursiveAddTypes(protocol,get(protocolData,path.shift()),path);
}

function createProtocol(customPackets, direction) {
  var proto = new ProtoDef();
  const packets=require("minecraft-data")("0.30c").protocol;

  proto.addTypes(minecraft);
  recursiveAddTypes(proto, merge(packets,customPackets), [direction]);
  return proto;
}

function createSerializer(isServer = false, customPackets) {
  return new Serializer(createProtocol(customPackets, !isServer ? 'toServer' : 'toClient'), "packet");
}

function createDeserializer(isServer = false, customPackets) {
  return new Parser(createProtocol(customPackets, isServer ? "toServer" : "toClient"), "packet");
}

module.exports = {
  createSerializer: createSerializer,
  createDeserializer: createDeserializer
};
