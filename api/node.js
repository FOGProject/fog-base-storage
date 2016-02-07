var nodeAPI = {};
var fs = require('fs');
var path  = require('path');
nodeAPI.bus = null;
nodeAPI.api = require('../../fog_modules/node/index');
nodeAPI.streamerKey = '';
nodeAPI.MCServers = [];
nodeAPI.master = '';
nodeAPI.Streamer = null;
nodeAPI.members = [];

//  Handle Socket input from Comm Server
nodeAPI.handleComm = function(data,socket) {
  switch (data.type) {
    case 'streamer': {
      key = data.key;
      out = {};
      switch (data.role) {
        case 'master': {
          out.function = 'register';
          if (key == api.node.master) {
            api.fog.log('Master Node registered!\n','info')
            out.message = 'success';
          } else {
            out.message = 'failure';
          }
          socket.send(JSON.stringify(out));
        }
        case 'slave': {
          out.function = 'register';
          if (api.node.members.indexOf(key) > -1) {
            out.message = 'success';
          } else {
            out.message = 'failure';
          }
          socket.send(JSON.stringify(out));
        }
      }
    }
    case 'mc': {
      // Build task info for Multicast Server
      taskID = data.taskID;
      
    }
  }
}

nodeAPI.init = function() {

  // listenSocket.on('connection', function(socket) {
  //   api.fog.log('Node connected to Server....','info');
  //   socket.on('register', function(data) {
  //     if (data.type === 'streamer' && data.key === api.node.streamerKey) {
  //       if (api.node.Streamer === null) {
  //         api.node.Streamer = req.socket;
  //       } else {
  //         socket.emit({
  //           message: 'Access Denied!',
  //         })
  //       }
  //       //  Is MC Server?
  //     } else if (data.type === 'mc') {
  //       // Send MC Server the options that are registered
  //       isRegistered = false;
  //       for (item in api.node.MCServers) {
  //         if (item.key === data.key) {
  //           isRegistered = true;
  //           socket.emit({message: item});
  //           return;
  //         }
  //       }
  //       if (!isRegistered) {
  //         socket.emit({message: 'Access Denied'});
  //       }
  //     }
  //   })
  // })

  myConfig = api.node.api.readConfig();
  api.node.members = myConfig.members;
  api.node.master = myConfig.master.id;
  // Start TFTP Server
  if (myConfig.self.tftp == true) {
    var opts = {};
    opts.port = 69;
    opts.host = '127.0.0.1';
    opts.root = path.join(__dirname, '../../tftp/');
    api.node.api.startTFTP(opts, function() {
      api.fog.log('Started TFTP Server\n','info');
    })
  }
  api.node.api.startStreamingServer({key: myConfig.self.id,
      host: myConfig.master.ip + ':' + api.fog.commPort + '/',
      role: myConfig.self.role,})
}



// Export API
module.exports = nodeAPI;
