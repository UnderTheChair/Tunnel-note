const serverURL = 'http://13.125.136.140:9000';


let drawSocket = io.connect(serverURL, {
  path: '/draw',
});

let tunnelBoxSocket = io.connect(serverURL, {
  path: '/tunnelBox',
})

socket_init()

// Disconnect socket before close window.
window.onbeforeunload = function () {
  drawsocket.emit('DISCONNECT');
  tunnelBoxSocket.emit('DISCONNECT');
}

function socket_init() {
  let accessToken = localStorage.accessToken

  drawSocket.emit('CONNECT', {
    accessToken: accessToken
  })

  tunnelBoxSocket.emit('CONNECT', {
    accessToken: accessToken
  })
}

drawSocket.on('DISCONNECT', () => {
  alert("DISCONNECT")
})

export {
  drawSocket, tunnelBoxSocket
}