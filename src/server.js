const net = require('net')
const EventEmitter = require('events').EventEmitter
const Client = require('./client')

class Server extends EventEmitter {
  constructor (customPackets) {
    super()
    this.customPackets = customPackets
  }

  listen (port, host) {
    this.socketServer = null
    this.clients = {}
    const self = this
    let nextId = 0
    self.socketServer = net.createServer()
    self.socketServer.on('connection', socket => {
      const client = new Client(true, this.customPackets)
      client._end = client.end
      client.end = function end (endReason) {
        client.write('disconnect_player', {
          disconnect_reason: endReason
        })
        client._end(endReason)
      }
      client.id = nextId++
      self.clients[client.id] = client
      client.on('end', function () {
        delete self.clients[client.id]
      })
      client.setSocket(socket)
      self.emit('connection', client)
    })
    self.socketServer.on('error', function (err) {
      self.emit('error', err)
    })
    self.socketServer.on('close', function () {
      self.emit('close')
    })
    self.socketServer.on('listening', function () {
      self.emit('listening')
    })
    self.socketServer.listen(port, host)
  }

  close () {
    let client
    for (const clientId in this.clients) {
      if (!(clientId in this.clients)) continue

      client = this.clients[clientId]
      client.end('ServerShutdown')
    }
    this.socketServer.close()
  }
}

module.exports = Server
