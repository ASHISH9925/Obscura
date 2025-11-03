const File = require('../models/File.js');

/**
 * Saves a file buffer and its metadata to the database.
 * @param {Buffer} fileBuffer - The buffer of the file to save.
 * @param {string} mimetype - The MIME type of the file.
 * @returns {string} The ID of the newly created file document.
 */
async function uploadFile(fileBuffer, mimetype) {
    try {
        const newFile = new File({
            data: fileBuffer,
            mimetype: mimetype
        });

        await newFile.save();
        return newFile._id; // Return the new file's ID

    } catch (error) {
        console.error('Error in uploadFile service:', error);
        throw new Error('Failed to save file to database: ' + error.message);
    }
}

/**
 * Retrieves a full file document (including data) by its ID.
 * @param {string} fileId - The MongoDB _id of the file to retrieve.
 * @returns {object} The full file document (including .data, .mimetype, etc.).
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


async function retrieveSingleTextFile(req,res){
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
