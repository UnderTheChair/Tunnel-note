// localhost로 연결한다.

const serverURL = 'http://ec2-15-164-213-126.ap-northeast-2.compute.amazonaws.com:9000'

let drawSocket = io.connect(serverURL, {
  path : '/draw',
});

let tunnelBoxSocket = io.connect(serverURL, {
  path : '/tunnelBox',
})

// Disconnect socket before close window.
window.onbeforeunload = function(){
  drawsocket.emit('DISCONNECT');
  tunnelBoxSocket.emit('DISCONNECT');
}
export {
  drawSocket, tunnelBoxSocket
}