var exports = module.exports = {};
var tftp = require('tftp');
var tftpServer = null;
var fs = require('fs');
var streamServer;
var mcServer;
exports.startTFTP = function(opts,cb) {
  var tftp = require('tftp');
  console.log('port: ' + opts.port)
  api.node.tftpServer = tftp.createServer ({
    address: opts.host || '127.0.0.1',
    port: opts.port || 69,
    root: opts.root || '../../tftp/',
    denyPUT: true,
  });
  api.node.tftpServer.listen();
  cb();
}

exports.readConfig = function() {
  myConfig = JSON.parse(fs.readFileSync(__dirname + '/config.json'));
  return myConfig;
}

exports.stopTFTP = function(cb) {
  tftpServer.on('close', function() {
    closed = true;
    if (!connections.length) {
      return console.log ('TFTP Server closing...');
    }
    // Abort all the current transfers
    for (var i = 0; i < connections.length; i++) {
      connections[i].abort ();
    }
  });
  tftpServer.close ();
  cb();
}

exports.startStreamingServer = function(opts) {
  streamFile = __dirname + '/streamer.js';
  fork = require('child_process').fork;
  streamServer = fork(streamFile,[opts.host,opts.key,opts.role],{
    stdio: 'pipe',
  });
}

exports.stopStreamer = function(cb) {
  streamServer.kill('SIGINT');
  cb();
}

exports.stopMCServer = function(cb) {
  mcServer.kill('SIGINT');
}

exports.startMCServer = function(opts) {
  mcFile = __dirname + '/multicast.js';
  fork = require('child_process').fork;
  mcServer = fork(mcFile,[opts.host,opts.taskID],{
    stdio: 'pipe',
  });
}
