const { mongoose, autoIncrement } = require('../mongo')
const userSchema = require('./user')

const PDFSchema = mongoose.Schema({
    id : {type: Number, required : true, unique : true},
    name : {type: String, required : true},
    create_time : {type: Date, default : Date.now},
    modification_time : {type : Date, default : Date.now},
    thumbnail : {type : String},
    user_list : [{type: mongoose.Schema.Types.ObjectId, ref: userSchema}], 
    size : {type : Number, required : true}, 
    pdf_file_path : {type : String, required : true },
})

PDFSchema.plugin(autoIncrement, {
    model: 'pdf',
    field: 'id',
    startAt: 1
})

module.exports = mongoose.model("pdf", PDFSchema);

