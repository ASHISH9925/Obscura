const File = require('../models/File.js');
const EncryptionAnalytics = require('../models/EncryptionAnalytics.js')
/**
 * Saves a file buffer and its metadata to the database.
 * @param {Buffer} fileBuffer - The buffer of the file to save.
 * @param {string} mimetype - The MIME type of the file.
 * @param {(Date|number|string)} [expiresAt] - Optional expiration timestamp for the file (Date, unix epoch, or parsable string).
 * @returns {Promise<import("mongoose").Types.ObjectId>} The ID of the newly created file document.
 */
async function uploadFile(fileBuffer, mimetype, expiresAt) {
    try {
        const newFile = new File({
            data: fileBuffer,
            expiresAt
        });

        await newFile.save();


        // Ensure mimetype is present on insert; increment count otherwise
        await EncryptionAnalytics.findOneAndUpdate(
            { mimetype: mimetype },
            { $inc: { count: 1 }, $setOnInsert: { mimetype: mimetype } },
            { upsert: true, new: true }
        );

        return newFile._id; // Return the new file's ID

    } catch (error) {
        console.error('Error in uploadFile service:', error);
        throw new Error('Failed to save file to database: ' + error.message);
    }
}

/**
 * Retrieves a full file document (including data) by its ID.
 * @param {string} fileId - The MongoDB _id of the file to retrieve.
 * @returns {Promise<import('mongoose').Document>} The full Mongoose file document (including .data, .mimetype, etc.).
 * @throws {Error} If the file is not found or the id format is invalid.
 */
async function retrieveFile(fileId) {
    try {
        const file = await File.findById(fileId);

        if (!file) {
            throw new Error('File not found');
        }
        return file;

    } catch (error) {
        console.error('Error in retrieveFile service:', error);
        
        if (error.name === 'CastError') {
             throw new Error('Invalid file ID format');
        }
        throw error;
    }
}


/**
 * Express handler to retrieve a single text file by id and send it as an attachment.
 * @param {import('express').Request} req - Express request object. Expects `req.params.id` to contain the file id.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>} Resolves after the response has been sent.
 */
async function retrieveSingleTextFile(req, res) {
    try {
        const file = await retrieveFile(req.params.id);

        res.set('Content-Type', "text/plain");
        res.set('Content-Disposition', `attachment; filename="encrypted"`);

        res.send(file.data);

    } catch (error) {
        if (error.message === 'File not found') {
            return res.status(404).send('File not found.');
        }
        if (error.message === 'Invalid file ID format') {
            return res.status(400).send('Invalid file ID format.');
        }
        res.status(500).send('Error retrieving file: ' + error.message);
    }
}

module.exports = {
    uploadFile,
    retrieveFile,
    retrieveSingleTextFile
};
