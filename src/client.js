const EventEmitter = require('events').EventEmitter
const debug = require('./debug')

const createSerializer = require('./transforms/serializer').createSerializer
const createDeserializer = require('./transforms/serializer').createDeserializer

class Client extends EventEmitter {
  constructor (isServer, customPackets) {
    super()
    this.isServer = !!isServer
    this.customPackets = customPackets
  }

  setSerializer () {
    this.serializer = createSerializer(this.isServer, this.customPackets)
    this.deserializer = createDeserializer(this.isServer, this.customPackets)

    this.serializer.on('error', (e) => {
      const parts = e.field ? e.field.split('.') : []
      parts.shift()
      const serializerDirection = !this.isServer ? 'toServer' : 'toClient'
      e.field = [serializerDirection].concat(parts).join('.')
      e.message = `Serialization error for ${e.field} : ${e.message}`
      this.emit('error', e)
    })

    this.deserializer.on('error', (e) => {
      const parts = e.field ? e.field.split('.') : []
      parts.shift()
      const deserializerDirection = this.isServer ? 'toServer' : 'toClient'
      e.field = [deserializerDirection].concat(parts).join('.')
      e.message = `Deserialization error for ${e.field} : ${e.message}`
      this.emit('error', e)
    })

    this.deserializer.on('data', (parsed) => {
      parsed.metadata.name = parsed.data.name
      parsed.data = parsed.data.params
      this.emit('packet', parsed.data, parsed.metadata)

      debug('reading packet ' + '.' + parsed.metadata.name)
      debug(parsed.data)
      this.emit(parsed.metadata.name, parsed.data, parsed.metadata)
      this.emit('raw.' + parsed.metadata.name, parsed.buffer, parsed.metadata)
      this.emit('raw', parsed.buffer, parsed.metadata)
    })
  }

  setSocket (socket) {
    let ended = false

    const endSocket = () => {
      if (ended) return
      ended = true
      this.socket.removeListener('close', endSocket)
      this.socket.removeListener('end', endSocket)
      this.socket.removeListener('timeout', endSocket)
      this.emit('end', this._endReason)
    }

    const onFatalError = (err) => {
      this.emit('error', err)
      endSocket()
    }

    // const onError = (err) => this.emit('error', err)

    this.socket = socket

    if (this.socket.setNoDelay) { this.socket.setNoDelay(true) }

    this.socket.on('connect', () => this.emit('connect'))

    this.socket.on('error', onFatalError)
    this.socket.on('close', endSocket)
    this.socket.on('end', endSocket)
    this.socket.on('timeout', endSocket)

    this.setSerializer()
    this.socket.pipe(this.deserializer)
    this.serializer.pipe(this.socket)
  }

  end (reason) {
    this._endReason = reason
    if (this.socket) this.socket.end()
  }

  write (name, params) {
    debug('writing packet ' + '.' + name)
    debug(params)
    this.serializer.write({
      name,
      params
    })
  }

  writeRaw (buffer) {
    this.socket.write(buffer)
  }
}

module.exports = Client
