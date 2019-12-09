module.exports = (io) => {
   // Connection event
  io.sockets.on('connection', (socket)=>{

    socket.on('CONNECT', ({accessToken}) => {
      io.in(accessToken).clients((err, clients) => {
        if (clients.length >= 2) {
          let clients = io.sockets.adapter.rooms[accessToken].sockets
          let numClients = Object.keys(clients).length

          if (numClients >= 2) {
            for (let clientId in clients) {

              let clientSocket = io.sockets.connected[clientId];

              clientSocket.leave(accessToken);
              clientSocket.disconnect();
            }
          }
        }
        socket.accessToken = accessToken;
        socket.join(accessToken);
      });
    })
    
    //pc -> mobile
    socket.on('BOX_INIT', (position) => {
      socket.broadcast.to(socket.accessToken).emit('BOX_INIT', position); //broadcast
    });

    socket.on('BOX_SIZE_INIT', (sizeData) => {
      socket.broadcast.to(socket.accessToken).emit('BOX_SIZE_INIT', sizeData);
    });

    socket.on('BOX_MOVE', (position) => {
      socket.broadcast.to(socket.accessToken).emit('BOX_MOVE', position);
    });

    socket.on('BOX_RESIZE', (position) => {
      socket.broadcast.to(socket.accessToken).emit('BOX_RESIZE', position);
    });

    socket.on('BOX_CLEAR', (position) => {
      socket.broadcast.to(socket.accessToken).emit('BOX_CLEAR');
    });

    socket.on('BOX_DOWN', (position) => {
      socket.broadcast.to(socket.accessToken).emit('BOX_DOWN');
    });

    //mobile -> pc
    socket.on('BOX_SIZE_INIT', (sizeData) => {
      socket.broadcast.to(socket.accessToken).emit('BOX_SIZE_INIT', sizeData);
    });

    socket.on('MOBILE_MOVE', (position) => {
      socket.broadcast.to(socket.accessToken).emit('MOBILE_MOVE', position);
    });
      
    socket.on('MOBILE_RESIZE', (position) => {
      socket.broadcast.to(socket.accessToken).emit('MOBILE_RESIZE', position);
    });

    socket.on('MOBILE_ROTATE', () => {
      socket.broadcast.to(socket.accessToken).emit('MOBILE_ROTATE', null);
    })
      
    
    socket.on('DISCONNECT', ()=>{
      socket.broadcast.to(socket.accessToken).emit('DISCONNECT');
      socket.leave(socket.accessToken);
      socket.disconnect();
    });
  });
}