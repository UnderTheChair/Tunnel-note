const { mongoose } = require('../mongo')
const PDFSchema = require('./pdf')

const userSchema = mongoose.Schema({
    email : {type: String, required: true, unique: true},
    password : {type: String, required: true},
    name : {type: String, required: true},
    pdf_list : [{type: mongoose.Schema.Types.ObjectId, ref: 'pdf'}]
})

module.exports = mongoose.model("user", userSchema);