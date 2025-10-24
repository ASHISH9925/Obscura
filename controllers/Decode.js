const crypto = require('crypto');

/**
 * Decrypts a Buffer using AES-256-GCM.
 * It expects the key and a single buffer containing the IV, encrypted data, and auth tag.
 * @param {Buffer} key - The 32-byte encryption key.
 * @param {Buffer} encryptedData - The buffer containing IV + encrypted content + auth tag.
 * @returns {Buffer} The decrypted data.
 */


function decryptBinaryData(key, encryptedData) {

  const iv = encryptedData.slice(0, 12);
  const authTag = encryptedData.slice(-16);
  const encrypted = encryptedData.slice(12, -16);


  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

  decipher.setAuthTag(authTag);
  
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
  
  return decrypted;
}


function decodeBinaryToFile(data) {
  const newlineChar = Buffer.from('\n', 'utf8')[0]; 
  

  const firstNewlineIndex = data.indexOf(newlineChar);
  if (firstNewlineIndex === -1) {
    throw new Error('Invalid data format: Cannot find filename separator.');
  }
  const nameBuffer = data.slice(0, firstNewlineIndex);
  
  const secondNewlineIndex = data.indexOf(newlineChar, firstNewlineIndex + 1);
  if (secondNewlineIndex === -1) {
    throw new Error('Invalid data format: Cannot find mimetype separator.');
  }
  const mimeBuffer = data.slice(firstNewlineIndex + 1, secondNewlineIndex);

  const fileBuffer = data.slice(secondNewlineIndex + 1);

  return {
    originalName: nameBuffer.toString('utf8'),
    mimeType: mimeBuffer.toString('utf8'),
    fileBuffer: fileBuffer
  };
}

const processFile = async (req, res, next) => {
  console.log('File dec controller has been hit!');
  

  if (!req.file) {
    return res.status(400).json({ message: 'No encrypted file was uploaded.' });
  }
  if (!req.body.key) {
    return res.status(400).json({ message: 'Encryption key is missing.' });
  }
  
  try {
    const encryptedFileBuffer = req.file.buffer;
    const keyHex = req.body.key; // The key is expected as a hex string from the form field

    // More validation: Check if the key is a valid hex string of the correct length (32 bytes = 64 hex chars)
    if (keyHex.length !== 64 || !/^[0-9a-fA-F]+$/.test(keyHex)) {
       return res.status(400).json({ message: 'Invalid key format. Please provide a 64-character hex key.' });
    }
    
    // Convert the hex key string back into a Buffer for the crypto functions
    const keyBuffer = Buffer.from(keyHex, 'hex');

    const decryptedData = decryptBinaryData(keyBuffer, encryptedFileBuffer);

    const originalFile = decodeBinaryToFile(decryptedData);

    
    res.setHeader('Content-Disposition', `attachment; filename="${originalFile.originalName}"`);
    res.setHeader('Content-Type', originalFile.mimeType);

    // Send the original file's binary data back to the user.
    res.send(originalFile.fileBuffer);

  } catch (error) {
    console.error('An error occurred during file decoding:', error.message);

    // Provide a more user-friendly error for common decryption failures.
    if (error.message.includes('Unsupported state') || error.message.includes('auth')) {
        return res.status(400).json({ message: 'Decryption failed. The key may be incorrect or the file may be corrupt.' });
    }
    
    next(error); 
  }
};

module.exports = {
  processFile,
  decryptBinaryData,
  decodeBinaryToFile
};
