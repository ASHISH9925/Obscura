const File = require('../models/File');

const getFileTypeStats = async (req, res) => {
    try {
        const stats = await File.aggregate([
            {
                $group: {
                    _id: '$mimetype',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        const formattedStats = stats.map(stat => ({
            fileType: stat._id,
            count: stat.count
        }));

        res.json({
            success: true,
            data: formattedStats
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
