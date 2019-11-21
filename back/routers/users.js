const express = require('express');
const router = express.Router();
const userModel = require('../db/models/user')
const jwt = require('jsonwebtoken')
const config = require('../config');


router.post('/signup', (req, res) => {

  let user = req.body;

  userModel.create(user).then(() => {
    res.send({ "data": "ok" });
  }).catch((err) => {
    res.send(err);
  });

})

router.post('/login', (req, res) => {
  let userData = req.body;

  // check the user info & generate the jwt
  const check = (user) => {
    if (!user) {
      // user does not exist
      throw new Error('login failed')
    } else {
      // user exists, check the password
      if (userData.password === user.password) {
        
        // create a promise that generates jwt asynchronously
        const p = new Promise((resolve, reject) => {
          jwt.sign(
            user.email,
            config.secret,
            (err, token) => {
              if (err) reject(err)
              resolve(token)
            })
        })
        return p
      } else {
        throw new Error('login failed')
      }
    }
  }

  // respond the token 
  const respond = (token) => {
    res.json({
      message: 'logged in successfully',
      accessToken : token,
    })
  }

  // error occured
  const onError = (error) => {
    res.status(403).json({
      message: error.message
    })
  }

  // find the user
  userModel.findOne(userData)
    .then(check)
    .then(respond)
    .catch(onError)
})

module.exports = router;