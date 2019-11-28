module.exports = (io) => {
   // Connection event
  io.sockets.on('connection', (socket)=>{
    socket.join('tunnel_box');
    
    //pc -> mobile
    socket.on('BOX_INIT', (position) => {
      io.sockets.emit('BOX_INIT', position); //broadcast
    });

    socket.on('BOX_MOVE', (position) => {
      socket.broadcast.to('tunnel_box').emit('BOX_MOVE', position);
    });

    socket.on('BOX_RESIZE', (position) => {
      socket.broadcast.to('tunnel_box').emit('BOX_RESIZE', position);
    });
    
    socket.on('BOX_CLEAR', (position) => {
      socket.broadcast.to('tunnel_box').emit('BOX_CLEAR');
    });

    socket.on('BOX_DOWN', (position) => {
      socket.broadcast.to('tunnel_box').emit('BOX_DOWN');
    });

    //mobile -> pc
    socket.on('BOX_SIZE_INIT', (sizeData) => {
      socket.broadcast.to('tunnel_box').emit('BOX_SIZE_INIT', sizeData);
    });

    socket.on('MOBILE_MOVE', (position) => {
      socket.broadcast.to('tunnel_box').emit('MOBILE_MOVE', position);
    });
      
    socket.on('MOBILE_RESIZE', (position) => {
      socket.broadcast.to('tunnel_box').emit('MOBILE_RESIZE', position);
    });
      
    
    socket.on('DISCONNECT', ()=>{
      socket.broadcast.to('tunnel_box').emit('DISCONNECT');
      socket.leave('tunnel_box');
      socket.disconnect();
    });
  });
}