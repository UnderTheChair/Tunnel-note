
// localhost로 연결한다.
var socket = io.connect('http://15.164.213.126:9000');

// 서버에서 news 이벤트가 일어날 때 데이터를 받는다.
socket.on('SENDED_MESSAGE', (data) =>{
    console.log(data);

});