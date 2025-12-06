const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    data: {
        type: Buffer,
        required: true
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

fileSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('File', fileSchema);