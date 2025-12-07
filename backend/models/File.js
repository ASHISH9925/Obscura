const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const fileSchema = new mongoose.Schema({
    // Public, non-sequential file identifier exposed to users
    file_id: {
        type: String,
        required: true,
        unique: true,
        index: true,
        default: () => uuidv4(),
    },
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