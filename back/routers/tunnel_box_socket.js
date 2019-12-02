module.exports = (io) => {
   // Connection event
  io.sockets.on('connection', (socket)=>{
    socket.on('CONNECT', ({accessToken}) => {
      socket.accessToken = accessToken
      socket.join(accessToken);
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
    
    socket.on('PC_MOVE_END', () => {
      socket.broadcast.to(socket.accessToken).emit('PC_MOVE_END', null);
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
      
    
    socket.on('DISCONNECT', ()=>{
      
      socket.broadcast.to(socket.accessToken).emit('DISCONNECT');
      socket.leave(socket.accessToken);
      socket.disconnect();
    });
  });
}