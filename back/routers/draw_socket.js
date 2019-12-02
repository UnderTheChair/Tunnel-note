module.exports = (io) => {
  io.sockets.on('connection', (socket) => {

    socket.on('CONNECT', ({ accessToken }) => {

      io.in(accessToken).clients((err, clients) => {
        if (clients.length >= 2) {
          let clients = io.sockets.adapter.rooms[accessToken].sockets
          let numClients = Object.keys(clients).length

          if (numClients >= 2) {
            for (let clientId in clients) {

              let clientSocket = io.sockets.connected[clientId];

              clientSocket.emit('DISCONNECT');
              clientSocket.leave(accessToken);
              clientSocket.disconnect();
            }
          }
        }
        socket.accessToken = accessToken;
        socket.join(accessToken);
      });

    })

    socket.on('SEND_MESSAGE', (data) => {
      io.sockets.emit('SENDED_MESSAGE', data); //broadcast
    });

    socket.on('MOUSEDOWN', (data) => {

      socket.broadcast.to(socket.accessToken).emit('MOUSEDOWN', data);
    })

    socket.on('MOUSEUP', (data) => {
      socket.broadcast.to(socket.accessToken).emit('MOUSEUP', (data));
    })

    socket.on('MOUSEMOVE', (data) => {
      socket.broadcast.to(socket.accessToken).emit('MOUSEMOVE', data);
    })

    socket.on('SETUP', (data) => {
      socket.broadcast.to(socket.accessToken).emit('SETUP', data);
    })

    socket.on('DISCONNECT', (data) => {
      console.log("DISCONNECT")
      console.log("close +++ ", data)
      socket.leave(socket.accessToken);
      socket.disconnect();
    })
  });
}
