// Globals
var opts = {};
var udp = require('dgram');
var socket;
var clientCount = 0;
var clients = [];
var files = [];
var currentFile = 0;
var chuckSize = 50 * 1024;
var fs = require('fs');
// Gets Task info from FOG Server and Builds opts table
function buildArgs(opts) {
  // First lets get the tas info from FOG
  mainServer = opts.host || 'localhost:40996/';
  var WebSocket = require('ws');
  var ws = new WebSocket('ws://' + mainServer);
  ws.on('open', function open() {
    ws.send(JSON.stringify({class: 'node',
    type: 'mc',
    taskID: opts.taskID, }));
  });

  ws.on('message', function(data, flags) {
    if (data.port != null) {
      opts.port = data.port;
      opts.address = data.address || '0.0.0.0';
      opts.broadcast = data.broadcast || null;
      opts.multicast = data.multicast || true;
      opts.multicastTTL = data.multicastTTL;
      opts.loopback = data.loopback || false;
      opts.reuseAddr = (data.reuseAddr === false) ? false : true;
      opts.timeout = data.timeout || 0;
      imagePath = data.path;
      var filesArr = fs.readdirSync(imagePath);
      re = /(?:\.([^.]+))?$/;
      for (var i in filesArr) {
        if (re.exec(i) === 'img') {
          files.push(imagePath + '/' + i);
        }
      }
      files.sort();
      createMulticastServer(opts);
    }
  });
}

// Creates Multicast Server
function createMulticastServer(opts) {
  var address         = opts.address       || '0.0.0.0';
  var port            = opts.port          || 12345;
  var broadcast       = opts.broadcast     || null;
  var multicast       = opts.multicast     || null;
  var multicastTTL    = opts.multicastTTL  || 1;
  var destination     = unicast            || multicast || broadcast;
  var loopback        = opts.loopback      || false;
  var reuseAddr       = (opts.reuseAddr === false) ? false : true;
  var timeOut         = opts.timeOut       || 0;
  socket = udp.createSocket({type: 'udp4', reuseAddr: reuseAddr });

  socket.end = function() {
    setImmediate(function() {
      socket.close();
    });
  };

  socket.pause = function() {
    socket.paused = true;
    return this;
  };

  socket.resume = function() {
    socket.paused = false;
    return this;
  };

  socket.on('message', function(msg, rinfo) {
    // GET ready message from client
    if (msg === 'ready') {
      clients.push(rinfo);

      // GET Client count.  If correct run file if not proceed
      if (clients.length === clientCount) {
        sendFile(currentFile);
      // Not all clients, check to see if is 0 and timeout specified
      }else if (clients.length === 0 && timeOut !== 0) {
        setTimeout(gotTimeout,(timeOut * 1000));
      }
    }
  });

  socket.on('error', startupErrorListener);

  socket.bind(port, address);

  socket.on('listening', function() {
    if (multicast) {
      // Set up for multicast
      try {
        socket.addMembership(multicast);
        socket.setMulticastTTL(multicastTTL);
        socket.setMulticastLoopback(loopback ? true : false);
      }catch (err) {
        socket.emit('error', err);
      }
    }else if (broadcast) {
      socket.setBroadcast(true);
    }
  });
  pipe = require('stream').prototype.pipe;
  socket.pipe = pipe;
}

// Fired when timeout called waiting for clients
function gotTimeout() {
  clientCount = clients.length;
  sendFile(currentFile);
}

function sendFile(fileToSend) {
  if (fileToSend <= files.length) {
    thisFile = files[fileToSend];
    currentFile++;
    rs = fs.createReadStream(thisFile,{highWaterMark: chuckSize});
    rs.pipe(socket);
    rs.on('close', function() {
      if (fileToSend == files.length) {
        setTimeout(StopServer(),5000);
      }
    });
  } else {

  }
}

function StopServer() {
  process.exit()
}
opts.host = process.argv[2];
opts.taskID = process.argc[4];
buildArgs(opts);
