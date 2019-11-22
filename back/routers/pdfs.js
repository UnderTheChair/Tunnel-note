const express = require('express');
const router = express.Router();
const pdfModel = require('../db/models/pdf')
const userModel = require('../db/models/user');
const authMiddleware = require('../middlewares/auth')
const multer = require('multer');
const fs = require('fs');
const PDF2Pic = require("pdf2pic");
 
const pdf2pic = new PDF2Pic({
  density: 100,           // output pixels per inch
  savename: "untitled",   // output file name
  savedir: "temp",    // output file location
  format: "png",          // output file format
  size: "600x600"         // output size in pixels
});

/**
 * Use for pdf2pic
 * 
 * Ubuntu: sudo apt-get install imagemagick ghostscript poppler-utils
 * OS X : brew install imagemagick ghostscript poppler
 * 
 */

//brew install imagemagick graphicsmagick

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
  let pdfPath = __dirname + '/..' + path + '/' + name;
  
  console.log(pdfPath);
  pdf2pic.convertToBase64(pdfPath, 1).then((resolve) => {
    if (resolve.base64) {
      console.log("image converter successfully!");
   
      // assuming you're using some ORM to save base64 to db
      pdfData['thumbnail'] = resolve.base64;
      return resolve;
    } else return resolve;
  })
  .then(() => {
    return userModel.findOne(userData);
  })
  .then((user) => {
    pdfData['user'] = { _id: user._id };

    pdfModel.create(pdfData).then((pdf) => {
      user['pdf_list'] = [...user['pdf_list'], { _id: pdf._id }];
      return userModel.updateOne(userData, user)
    })
  })
  .then(() => {
    res.send({data: "ok", name: name});
  })
  .catch((err) => {
    console.log(err);
    res.send(err);
  })

})

router.get('/', (req, res) => {
  let userData = { email: req.decoded };

  userModel.findOne(userData).populate('pdf_list').exec((err, data) => {
    res.send(data.pdf_list);
  })
})
module.exports = router;