module.exports = {
  string: [readString, writeString, 64],
  byte_array: [readByteArray, writeByteArray, sizeOfByteArray]
}

const PartialReadError = require('protodef').utils.PartialReadError

function readString (buffer, offset) {
  if (offset + 64 > buffer.length) { throw new PartialReadError() }
  let value = buffer.toString('ascii', offset, offset + 64)
  value = value.trim()
  return {
    value: value,
    size: 64
  }
}

function writeString (value, buffer, offset) {
  for (let i = value.length - 1; i < 64; i++) { value += ' ' }
  buffer.write(value, offset, 64, 'ascii')
  return offset + 64
}

// const zlib = require('zlib')

function readByteArray (buffer, offset) {
  const countResults = this.read(buffer, offset, 'i16')
  offset += 2

  if (offset + 1024 > buffer.length) { throw new PartialReadError() }

  return {
    value: buffer.slice(offset, offset + countResults.value),
    size: 2 + 1024
  }
}

function writeByteArray (value, buffer, offset) {
  offset = this.write(value.length, buffer, offset, 'i16')
  offset += value.copy(buffer, offset)
  const buf = Buffer.alloc(1024 - value.length)
  buf.fill(0)
  offset += buf.copy(buffer, offset)
  return offset
}

function sizeOfByteArray () {
  return 2 + 1024
}
