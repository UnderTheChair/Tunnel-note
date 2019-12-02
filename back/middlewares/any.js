const anyMiddleware = (req, res, next) => {
    req.decoded = 'any'
    
    next()
}

module.exports = anyMiddleware