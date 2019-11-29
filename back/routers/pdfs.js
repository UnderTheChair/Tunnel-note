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

// Set file upload storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let userPath = __dirname + '/../temp/' + req.decoded;
    let pdfPath = userPath + `/${file.originalname}`
    let cvsPath = pdfPath + '/cvs'
    console.log(file)

    if (!fs.existsSync(userPath)) fs.mkdirSync(userPath);
    if (!fs.existsSync(pdfPath)) {
      fs.mkdirSync(pdfPath);
      fs.mkdirSync(cvsPath)
    }

    cb(null, pdfPath) // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
})

const storageCvs = multer.diskStorage({
  destination: function (req, file, cb) {
    let userPath = __dirname + '/../temp/' + req.decoded;

    cb(null, userPath) // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
  }
})

const upload = multer({ storage: storage })
const uploadCvs = multer({ storage: storageCvs})

router.use('/', authMiddleware);


router.post('/upload', upload.single('pdfFile'), (req, res) => {
  let { name, size } = req.body
  let path = '/temp/' + req.decoded + `/${name}`;
  let userData = { email: req.decoded };
  let pdfData = { name: name, size: size, path: path };
  let pdfPath = __dirname + '/..' + path + `/${name}`;
  
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
      user['pdf_list'] = [{ _id: pdf._id }, ...user['pdf_list']];
      return userModel.updateOne(userData, user)
    })
  })
  .then(() => {
    res.send({data: "ok", name: name, thumbnail: pdfData.thumbnail});
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

router.post('/blob', (req, res) => {
  let userData = { email: req.decoded, pdfName: req.body.pdfName };
  
  var file = fs.createReadStream(__dirname + `/../temp/${userData.email}/${userData.pdfName}/${userData.pdfName}`);
  file.pipe(res);
})

router.post('/blob/cvs/save', uploadCvs.single('cvsFile'), (req, res) => {
  let email = req.decoded;
  let {pdfName} = req.body
  let {originalname} = req.file
  
  let oldPath =  __dirname + `/../temp/${email}/${originalname}`
  let newPath = __dirname + `/../temp/${email}/${pdfName}/cvs/${originalname}`
  
  fs.copyFileSync(oldPath, newPath)

  res.send({data: "ok"})
})

router.post('/blob/cvs/load', (req, res) => {
  let userData = { email: req.decoded, pdfName: req.body.pdfName, pdfPageNum: req.body.pdfPageNum };
  let path = __dirname + `/../temp/${userData.email}/${userData.pdfName}/cvs/`
  let cvsList = []
  for(let i = 0; i < userData.pdfPageNum; i++) {
    let bitmap = fs.readFileSync(path+`${i}-cvs.png`);
    let bitBuffer = new Buffer(bitmap)
    cvsList.append(bitBuffer.toString('base64'))
  }
  return res.send({cvsList: cvsList})

})
module.exports = router;