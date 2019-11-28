const express = require('express');
const router = express.Router();
const fs = require('fs');

router.post('/pickPDF', (req, res) => {
    res.send({
        data: "ok"
    })
})

router.get('/', (req, res) => {
    let {accessToken} = req.body
    
    var file = fs.createReadStream(__dirname + "/../temp/1/12_parallelism.pdf");
    file.pipe(res);
})
module.exports = router;