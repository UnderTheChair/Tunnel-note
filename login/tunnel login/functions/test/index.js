const express = require('express')

const app = express()

//데이터생성
app.post('/', (req,res) =>{
    res.send('post ok')
})

//데이터읽기
app.get('/', (req, res) => {
    res.send('read ok')
})
app.get('/:id', (req, res) => {
    res.send('read ok ' + req.params.id)
})

//데이터업데이트
app.put('/:id', (req, res) => {
    res.send('put ok ' + req.params.id)
})

app.delete('/:id', (req, res) => {
    res.send('delete ok ' + req.params.id)
})

module.exports = app