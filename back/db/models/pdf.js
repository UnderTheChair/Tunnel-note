const { mongoose, autoIncrement } = require('../mongo')
const userSchema = require('./user')

const PDFSchema = mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    create_time: { type: Date, default: Date.now },
    modification_time: { type: Date, default: Date.now },
    thumbnail: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    size: { type: Number, required: true },
    path: { type: String },
})

PDFSchema.plugin(autoIncrement, {
    model: 'pdf',
    field: 'id',
    startAt: 1
})

module.exports = mongoose.model("pdf", PDFSchema);

