module.exports = (io) => {
  io.sockets.on('connection', (socket) => {

    socket.on('CONNECT', ({accessToken}) => {
      socket.accessToken = accessToken;
      socket.join(accessToken);
    })

    socket.on('SEND_MESSAGE', (data) => {
      io.sockets.emit('SENDED_MESSAGE', data); //broadcast
    });
  
    socket.on('MOUSEDOWN',(data) => {
      
      socket.broadcast.to(socket.accessToken).emit('MOUSEDOWN',data);
    })
  
    socket.on('MOUSEUP',(data) => {
      socket.broadcast.to(socket.accessToken).emit('MOUSEUP', (data));
    })
  
    socket.on('MOUSEMOVE',(data) => {
      socket.broadcast.to(socket.accessToken).emit('MOUSEMOVE',data);
    })

    socket.on('SETUP', (data) => {
      socket.broadcast.to(socket.accessToken).emit('SETUP', data);
    })
  
    socket.on('DISCONNECT', (data)=>{
      console.log("DISCONNECT")
      console.log("close +++ " , data)
      socket.leave(socket.accessToken);
      socket.disconnect();
    })
  });
}
