const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs')
const users = require('./routers/users');
require('./db/mongo')

/*
DB Usage :
  Model import : const userModel = require('./db/models/user') 
  DB query : userModel.create(), userModel.find(), ... 
*/

// Set static file path for rendering html
app.set('views', __dirname + '/');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.static('web'));

// Set file upload storage 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
    }
  })
const upload = multer({storage:storage})
app.use(upload.single('pdf_file')); //  'pdf_file' is name of file input element in form

// Set bodyparser that parse body of request. So we will use req.body
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '1gb', extended: false }));

// For CORS policy
app.use((req, res, next) =>{
    res.header("Access-Control-Allow-Origin", "*")
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, UPGRADE');
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization")
    next()
})

//Open the listening server port
const server = app.listen(8000, function() {
    console.log('server running on port 8000');
});

const socketServer = require('http').createServer().listen(9000);
//Require socket.io about server
const drawIo = require('socket.io')(socketServer, {
  path : '/draw',
});
const tunnelBoxIo = require('socket.io')(socketServer, {
  path : '/tunnelBox'
})

require(__dirname + "/routers/draw_socket.js")(drawIo);
require(__dirname + "/routers/tunnel_box_socket.js")(tunnelBoxIo);

app.use('/users', users);

app.get('/',(req,res)=>{
    res.render('web/viewer.html');
})

app.post('/pdf/upload',(req,res)=>{
    res.send({"data":"success"});
})


