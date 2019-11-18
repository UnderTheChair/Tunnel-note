module.exports = (io) => {
   // Connection event
  io.sockets.on('connection', (socket)=>{
    socket.join('tunnel_box');
    
    socket.on('BOX_INIT', (position) => {
      io.sockets.emit('BOX_INIT', position); //broadcast
    });

    socket.on('BOX_MOVE', (position) => {
      socket.broadcast.to('tunnel_box').emit('BOX_MOVE', position);
    })
    
    socket.on('BOX_CLEAR', (position) => {
      socket.broadcast.to('tunnel_box').emit('BOX_CLEAR');
    })

    socket.on('BOX_DOWN', (position) => {
      socket.broadcast.to('tunnel_box').emit('BOX_DOWN');
    })
    
    socket.on('DISCONNECT', ()=>{
      socket.broadcast.to('tunnel_box').emit('DISCONNECT');
      socket.leave('tunnel_box');
      socket.disconnect();
    })
  })
}