const mongoose = require('mongoose');

const EncryptionAnalyticsSchema = new mongoose.Schema({
    mimetype: { type: String, required: true, unique: true },
    count: { type: Number, default: 1 }
});

module.exports = mongoose.model('EncryptionAnalytics', EncryptionAnalyticsSchema);
