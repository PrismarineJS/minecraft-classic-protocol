const Server = require('./server')

function createServer (options) {
  options = options || {}
  const port = options.port != null
    ? options.port
    : options['server-port'] != null
      ? options['server-port']
      : 25565
  const host = options.host || '0.0.0.0'
  // const kickTimeout = options.kickTimeout || 10 * 1000
  const checkTimeoutInterval = options.checkTimeoutInterval || 4 * 1000
  // const onlineMode = options['online-mode'] == null ? true : options['online-mode']
  // const beforePing = options.beforePing || null
  // const enablePing = options.ping == null ? true : options.ping
  const customPackets = options.customPackets || {}

  const server = new Server(customPackets)

  server.name = options.name || 'Minecraft Server'
  server.motd = options.motd || 'A Minecraft server'
  server.maxPlayers = options['max-players'] || 20
  server.playerCount = 0
  server.onlineModeExceptions = {}

  server.on('connection', function (client) {
    client.once('player_identification', onLogin)
    client.on('end', onEnd)

    // const ping = true
    let pingTimer = null

    function pingLoop () {
      client.write('ping', {})
    }

    function startPing () {
      pingTimer = setInterval(pingLoop, checkTimeoutInterval)
    }

    function onEnd () {
      clearInterval(pingTimer)
    }

    function onLogin (packet) {
      client.username = packet.username
      client.identification_byte = packet.unused
      client.verification_key = packet.verification_key

      if (options.handshake) {
        options.handshake(function () {
          continueLogin()
        })
      } else { continueLogin() }
    }

    function continueLogin () {
      client.write('server_identification', {
        protocol_version: 0x07,
        server_name: server.name,
        server_motd: server.motd,
        user_type: 0
      })
      server.emit('login', client)
      startPing()
    }
  })
  server.listen(port, host)
  return server
}

module.exports = createServer
