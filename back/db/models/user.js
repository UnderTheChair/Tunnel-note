const { mongoose } = require('../mongo')
const PDFSchema = require('./pdf')

const userSchema = mongoose.Schema({
    id : {type: String, required : true, unique : true},
    password : {type: String, required : true,},
    name : {type: String, required : true},
    email : {type: String, required : true},
    pdf_list : [{type: mongoose.Schema.Types.ObjectId, ref: PDFSchema}]
})

module.exports = mongoose.model("user", userSchema);