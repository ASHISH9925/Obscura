const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    data: {
        type: Buffer,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('File', fileSchema);