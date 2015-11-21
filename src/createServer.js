var Server = require('./server');

function createServer(options) {
  options = options || {};
  var port = options.port != null ?
    options.port :
    options['server-port'] != null ?
    options['server-port'] :
    25565;
  var host = options.host || '0.0.0.0';
  var ping = options.pingTimeout || 10 * 1000;
  var checkTimeoutInterval = options.checkTimeoutInterval || 4 * 1000;
  var onlineMode = options['online-mode'] == null ? true : options['online-mode'];
  var beforePing = options.beforePing || null;
  var enablePing = options.ping == null ? true : options.ping;

  var server = new Server();
  
  server.motd = options.motd || "A Minecraft server";
  server.maxPlayers = options['max-players'] || 20;
  server.playerCount = 0;
  server.onlineModeExceptions = {};
  
  server.on("connection", function (client) {
        client.once('player_identification', onLogin);
        client.once('ping_start', onPing);
        client.on('end', onEnd);

        var ping = false;
        var loggedIn = false;
        var lastPing = null;

        var keepPingTimer = null;
        var loginKickTimer = setTimeout(kickForNotLoggingIn, pingTimeout);

        var serverId;

        function kickForNotLoggingIn() {
          client.end('LoginTimeout');
        }

        function pingLoop() {
          if (!ping)
            return;

          var elapsed = new Date() - lastPing;
          if (elapsed > pingTimeout) {
            client.end('PingTimeout');
            return;
          }
          client.write('ping', {});
        }

        function onPing(packet) {
          lastPing = new Date();
        }

        function startPing() {
          ping = true;
          lastPing = new Date();
          pingTimer = setInterval(pingLoop, checkTimeoutInterval);
          client.on('ping', onPing);
        }

        function onEnd() {
          clearInterval(pingTimer);
          clearTimeout(loginKickTimer);
        }

        function onLogin(packet) {}

        function loginClient() {}

        server.listen(port, host);
  });
  return server;
}

module.exports = {createServer:createServer};