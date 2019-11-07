module.exports = (io) => {
   // Connection event
  io.sockets.on('connection', (socket)=>{
    socket.join('tunnel_box');
    
    socket.on('BOX_INIT', (data) => {
        io.sockets.emit('SENDED_MESSAGE',data); //broadcast
    });

    socket.on('BOX_MOVE', (data) => {

    })
    
    socket.on('DISCONNECT', ()=>{
      socket.leave('tunnel_box');
      socket.disconnect();
    })
  })
}