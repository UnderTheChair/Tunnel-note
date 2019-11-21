module.exports = (io) => {
  io.sockets.on('connection', (socket) => {

    socket.join('draw');
    let room = io.sockets.adapter.rooms['draw'];
    if (room.length > 2) {
      socket.leave('draw');
      socket.disconnect;
      return;
    }

    socket.on('SEND_MESSAGE', (data) => {
      if (room.length > 2) {
        return;
      }
      io.sockets.emit('SENDED_MESSAGE', data); //broadcast
    });

    socket.on('MOUSEDOWN', (data) => {
      if (room.length > 2) {
        return;
      }
      socket.broadcast.to('draw').emit('MOUSEDOWN', data);
    })

    socket.on('MOUSEUP', () => {
      socket.broadcast.to('draw').emit('MOUSEUP');
    })

    socket.on('MOUSEMOVE', (data) => {
      if (room.length > 2) {
        return;
      }
      socket.broadcast.to('draw').emit('MOUSEMOVE', data);
    })

    socket.on('SETUP', () => {
      if (room.length > 2) {
        return;
      }
      socket.broadcast.to('draw').emit('SETUP');
    })

    socket.on('DISCONNECT', () => {
      socket.leave('draw');
      socket.disconnect();
    })
  });
}

