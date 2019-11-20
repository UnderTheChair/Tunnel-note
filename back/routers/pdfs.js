const express = require('express');
const router = express.Router();
const pdfModel = require('../db/models/pdf')

router.post('/upload', (req, res) => {
  let {name, size} = req.body
  console.log(req.body);
  let pdfData = {name: name, size: size, path: "/uploads"};
  pdfModel.create(pdfData).then((data) => {
    res.send({"data": "ok"});
  }).catch(err => {
    res.send(err);
  })
})

module.exports = router;