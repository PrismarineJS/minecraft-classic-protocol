const mc = require('minecraft-classic-protocol')
const cpe = require('minecraft-classic-protocol-extension').protocol
const ClassiCube = require('ClassiCube')
const getServer = async () => {
  const cl = new ClassiCube('classicube.json')
  cl.login('u9g', 'xxx')
  const res = await cl.getServers()
  // const server = Object.values(res.servers).find(o => o.ip === '206.189.116.162')
  const server = Object.values(res.servers)[39]
  const toRet = { host: server.ip, port: server.port, mppass: server.mppass, username: 'u9g' }
  console.log(`mc://${toRet.host}:${toRet.port}/${toRet.username}/${toRet.mppass}`)
  return toRet
}

async function main () {
  const { host, port, username, mppass } = await getServer()
  const targetClient = mc.createClient({
    host,
    port,
    username,
    verificationKey: mppass,
    customPackets: cpe,
    cpe: true
  })

  targetClient.on('packet', (data, meta) => {
    console.log(meta.name, data)
  })
}

main()
