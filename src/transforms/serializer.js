const ProtoDef = require('protodef').ProtoDef
const Serializer = require('protodef').Serializer
const Parser = require('protodef').Parser

const merge = require('lodash.merge')
const get = require('lodash.get')

const minecraft = require('../datatypes/minecraft')

function recursiveAddTypes (protocol, protocolData, path) {
  if (protocolData === undefined) { return }

  if (protocolData.types) { protocol.addTypes(protocolData.types) }

  recursiveAddTypes(protocol, get(protocolData, path.shift()), path)
}

function createProtocol (customPackets, direction) {
  const proto = new ProtoDef()
  const packets = require('minecraft-data')('0.30c').protocol

  proto.addTypes(minecraft)
  recursiveAddTypes(proto, merge(packets, customPackets), [direction])
  return proto
}

function createSerializer (isServer = false, customPackets) {
  return new Serializer(createProtocol(customPackets, !isServer ? 'toServer' : 'toClient'), 'packet')
}

function createDeserializer (isServer = false, customPackets) {
  return new Parser(createProtocol(customPackets, isServer ? 'toServer' : 'toClient'), 'packet')
}

module.exports = {
  createSerializer: createSerializer,
  createDeserializer: createDeserializer
}
