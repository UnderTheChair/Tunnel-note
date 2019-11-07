// localhost로 연결한다.

const serverURL = 'http://localhost:9000'

let drawSocket = io.connect(serverURL, {
  path : '/draw',
});

let tunnelBoxSocket = io.connect(serverURL, {
  path : '/tunnelBox',
})

// Disconnect socket before close window.
window.onbeforeunload = function(){
  drawsocket.emit('DISCONNECT');
}
export {
  drawSocket, tunnelBoxSocket
}