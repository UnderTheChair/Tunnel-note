const express = require('express');
const router = express.Router();
const pdfModel = require('../db/models/pdf')
const userModel = require('../db/models/user');
const authMiddleware = require('../middlewares/auth')
const multer = require('multer');
const fs = require('fs');

// Set file upload storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let path = __dirname + '/../temp/' + req.decoded;

    if (!fs.existsSync(path)) fs.mkdirSync(path);

    cb(null, 'temp/' + req.decoded) // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
})

const upload = multer({ storage: storage })

router.use('/', authMiddleware);
router.use(upload.single('pdfFile')); //  'pdf_file' is name of file input element in form

router.post('/upload', (req, res) => {
  let { name, size } = req.body
  let path = '/temp/' + req.decoded;
  let userData = { email: req.decoded };
  let pdfData = { name: name, size: size, path: path };

  userModel.findOne(userData).then((user) => {
    pdfData['user'] = { _id: user._id };

    pdfModel.create(pdfData).then((pdf) => {
      user['pdf_list'] = [...user['pdf_list'], { _id: pdf._id }];
      userModel.updateOne(userData, user).then((pdf) => {
        res.send({ data: 'ok' });
      })
    })
  }).catch((err) => {
    res.send(err);
  })

})

router.get('/', (req, res) => {
  let userData = {email: req.decoded};
  
  userModel.findOne(userData).populate('pdf_list').exec((err, data) => {
    res.send(data.pdf_list);
  })
})
module.exports = router;