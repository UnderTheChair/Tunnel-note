import {SERVER_IP} from './config.js'
const serverURL = `http://${SERVER_IP}:9000`;


let drawSocket = io.connect(serverURL, {
  path: '/draw',
});

let tunnelBoxSocket = io.connect(serverURL, {
  path: '/tunnelBox',
})

socket_init()

// Disconnect socket before close window.
window.onunload = window.onbeforeunload = async function () {
  await tunnelBoxSocket.emit('DISCONNECT');
  await drawsocket.emit('DISCONNECT');
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
