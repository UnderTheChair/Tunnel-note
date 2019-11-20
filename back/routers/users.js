const express = require('express');
const router = express.Router();
const userModel = require('../db/models/user')

router.post('/signup', (req, res) => {

  let user = req.body;

  userModel.create(user).then(() => {
    res.send({"data": "ok"});
  }).catch((err) => {
    res.send(err);
  });

})

router.post('/login', (req, res) => {
  let user = req.body;
  
  userModel.findOne(user).then((data) => {
    console.log(data);
    if (data == null) {
      res.send({"data": "Not Find"});
    } else res.send({
      "data": "ok",
      "accessToken": data.email
    });

  }).catch((err) => {
    res.send(err);
  })
})

module.exports = router;