const net = require('net')
const dns = require('dns')
const Client = require('./client')
const assert = require('assert')

module.exports = createClient

Client.prototype.connect = function (port, host) {
  const self = this
  if (port === 25565 && net.isIP(host) === 0) {
    dns.resolveSrv('_minecraft._tcp.' + host, (_, addresses) => {
      if (addresses && addresses.length > 0) {
        self.setSocket(net.connect(addresses[0].port, addresses[0].name))
      } else {
        self.setSocket(net.connect(port, host))
      }
    })
  } else {
    self.setSocket(net.connect(port, host))
  }
}

function createClient (options) {
  assert.ok(options, 'options is required')
  const port = options.port || 25565
  const host = options.host || 'localhost'
  const customPackets = options.customPackets || {}

  assert.ok(options.username, 'username is required')
  const connectVanilla = () => {
    const client = new Client(false, customPackets)
    client.on('connect', onConnect)
    client.username = options.username
    client.connect(port, host)
    function onConnect () {
      client.write('player_identification', {
        protocol_version: 0x07,
        username: client.username,
        verification_key: '',
        unused: 0x00
      })
    }
    return client
  }
  const connectCPE = () => {
    const client = new Client(false, customPackets)
    client.on('connect', onConnect)
    client.username = options.username
    client.connect(port, host)
    function onConnect () {
      client.state = 'handshake'
      client.write('player_identification', {
        protocol_version: 0x07,
        username: client.username,
        verification_key: options.verificationKey,
        unused: 0x42
      })
      const listener = (data, { name }) => {
        if (name === 'ext_info') {
          client.write(name, {
            app_name: 'ClassiCube 1.2.6',
            extension_count: data.extension_count
          })
        } else if (name === 'ext_entry' || name === 'custom_block_support_level') {
          client.write(name, data)
        } else if (name === 'server_identification') {
          client.state = 'play'
          client.off('packet', listener)
        }
      }
      client.on('packet', listener)
    }
    return client
  }
  return options.cpe ? connectCPE() : connectVanilla()
}
