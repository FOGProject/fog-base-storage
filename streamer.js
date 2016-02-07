var listenSocket;
var bus;
var opts = {};
function startStreamer() {
  myPort = opts.port || 8080;
  mainServer = opts.host || 'localhost:40996/';
  myRole = opts.role || 'slave';
  var WebSocket = require('ws');
  var ws = new WebSocket('ws://' + mainServer);
  ws.on('open', function open() {
    ws.send(JSON.stringify({class: 'node',
    type: 'streamer',
    role: myRole,key: opts.key, }));
  });

  ws.on('message', function(data, flags) {
    switch (data.function) {
      case 'register': {
        if (data.message == 'success') {
          // Create main Stream server; listens for boot client connects
          listenSocket = require('socket.io').listen(myPort);
          // Connect to Main Server for Comm
          listenSocket.of('/connect').on('connection', function(socket) {

            // The Upload Function
            ss(socket).on('put', function(stream, data) {
              var filename = path.basename(data.file);
              stream.pipe(fs.createWriteStream(filename));
            });

            // The Get function
            socket.of('get', function(data) {
              var filename = path.basename(data.file);
              ss(socket).emit('get', stream, {name: filename});
              fs.createReadStream(filename).pipe(str).pipe(stream);
            });
          });
        }
      }
    }
  });
}

opts.host = process.argv[2];
opts.key = process.argv[3];
opts.role = process.argv[4];
startStreamer();
