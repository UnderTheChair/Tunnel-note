const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const users = require('./routers/users');
const pdfs = require('./routers/pdfs');
const pdfsCo = require('./routers/pdfs-co');
const config = require('./config')
const multer = require('multer')

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

app.set('jwt-secret', config.secret)


// Set bodyparser that parse body of request. So we will use req.body
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '1gb', extended: true }));
app.use(bodyParser.json({type: 'application/json'}));

// For CORS policy
app.use((req, res, next) =>{
    res.header("Access-Control-Allow-Origin", "*")
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, UPGRADE');
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization, application/pdf, text/plain, application/json")
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
app.use('/pdfs', pdfs);
app.use('/pdfs-co', pdfsCo)
app.get('/',(req,res)=>{
    res.render('web/viewer.html');
})

app.post('/pdf/upload',(req,res)=>{
    res.send({"data":"success"});
})


