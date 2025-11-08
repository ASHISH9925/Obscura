const EncryptionAnalytics = require('../models/EncryptionAnalytics');

const getFileTypeStats = async (req, res) => {
    try {
        // Aggregate and return mimetype as fileType along with count, sorted by count desc
        const stats = await EncryptionAnalytics.aggregate([
            { $sort: { count: -1 } },
            { $project: { _id: 0, fileType: '$mimetype', count: 1 } }
        ]);

        // Ensure response shape is consistent
        res.json({
            success: true,
            data: stats // already in the form [{ fileType, count }, ...]
        });
    } catch (error) {
        console.error('Error fetching file type stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching file type statistics'
        });
    }
};

module.exports = { getFileTypeStats };
