module.exports = (io) => {
  io.sockets.on('connection', (socket) => {

    socket.join('draw');
    
    socket.on('SEND_MESSAGE', (data) => {
        io.sockets.emit('SENDED_MESSAGE',data); //broadcast
    });
  
    socket.on('MOUSEDOWN',(data) => {
      socket.broadcast.to('draw').emit('MOUSEDOWN',data);
    })
  
    socket.on('MOUSEUP',() => {
      socket.broadcast.to('draw').emit('MOUSEUP');
    })
  
    socket.on('MOUSEMOVE',(data) => {
      socket.broadcast.to('draw').emit('MOUSEMOVE',data);
    })

    socket.on('SETUP', () => {
      socket.broadcast.to('draw').emit('SETUP');
    })
  
    socket.on('DISCONNECT',()=>{
      socket.leave('draw');
      socket.disconnect();
    })
  });
}