const jwt = require('jsonwebtoken')
const config = require('../config');

const authMiddleware = (req, res, next) => {
    
    if ( req.headers['access-control-request-headers'] === 'authorization')
        return next();

    const token = req.headers.authorization.split('Bearer ')[1];
    
    // token does not exist 
    if (!token) {
        
        return res.status(403).json({
            success: false,
            message: 'token is invalid'
        })
    }

    // create a promise that decodes the token
    const p = new Promise(
        (resolve, reject) => {
            jwt.verify(token, config.secret, (err, decoded) => {
                if (err) reject(err)
                resolve(decoded)
            })
        }
    )

    // if it has failed to verify, it will return an error message
    const onError = (error) => {
        res.status(403).json({
            success: false,
            message: error.message
        })
    }

    // process the promise
    p.then((decoded) => {
        req.decoded = decoded
        next()
    }).catch(onError)

};

module.exports = authMiddleware
