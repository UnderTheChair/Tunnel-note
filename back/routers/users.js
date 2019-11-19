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

module.exports = router;