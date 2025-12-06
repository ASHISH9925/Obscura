const crypto = require("crypto");
const { decryptImage } = require("./ImageSteganography"); 
const { retrieveFile } = require("./FileHandlers");

/**
 * Decrypts a Buffer formatted as IV|ciphertext|authTag using AES-256-GCM.
 * @param {Buffer} key - 32-byte AES key.
 * @param {Buffer} encryptedData - Buffer formatted as 12-byte IV | ciphertext | 16-byte auth tag.
 * @returns {Buffer} Decrypted plaintext.
 * @throws {Error} If authentication fails or key/IV are invalid.
 */
function decryptBinaryData(key, encryptedData) {
  const iv = encryptedData.slice(0, 12);
  const authTag = encryptedData.slice(-16);
  const encrypted = encryptedData.slice(12, -16);

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted;
}

/**
 * Decodes a buffer in the format: <name>\n<mime>\n<bytes>.
 * @param {Buffer} data - The combined, decrypted file buffer.
 * @returns {{ originalName: string, mimeType: string, fileBuffer: Buffer }}
 * @throws {Error} If expected separators are missing.
 */
function decodeBinaryToFile(data) {
  const newlineChar = Buffer.from("\n", "utf8")[0];

  const firstNewlineIndex = data.indexOf(newlineChar);
  if (firstNewlineIndex === -1) {
    throw new Error("Invalid data format: Cannot find filename separator.");
  }
  const nameBuffer = data.slice(0, firstNewlineIndex);

  const secondNewlineIndex = data.indexOf(newlineChar, firstNewlineIndex + 1);
  if (secondNewlineIndex === -1) {
    throw new Error("Invalid data format: Cannot find mimetype separator.");
  }
  const mimeBuffer = data.slice(firstNewlineIndex + 1, secondNewlineIndex);

  const fileBuffer = data.slice(secondNewlineIndex + 1);

  return {
    originalName: nameBuffer.toString("utf8"),
    mimeType: mimeBuffer.toString("utf8"),
    fileBuffer: fileBuffer,
  };
}

/**
 * Express handler to retrieve an encrypted file, extract the AES key from a key-image,
 * decrypt the file, and return the original file as a download.
 * @param {import('express').Request} req - Expects req.body.fileUrl and an uploaded image as req.file.
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
const processFile = async (req, res, next) => {
  // console.log("File decode controller has been hit!");

  if (!req.body.fileUrl) {
    return res.status(400).json({ message: "The file URL is missing." });
  }
  if (!req.file) {
    return res.status(400).json({ message: "No key-image was uploaded." });
  }

  try {
    const fileId = req.body.fileUrl.split('/').pop();
    const imageBuffer = req.file.buffer;
    const { aesKey } = await decryptImage(imageBuffer);
    const keyBuffer = Buffer.from(aesKey, "hex"); 
    
 
    const encryptedFileDoc = await retrieveFile(fileId);
    
    if (!encryptedFileDoc || !encryptedFileDoc.data) {
        throw new Error('File not found or is empty.');
    }
    const encryptedFileBuffer = encryptedFileDoc.data;


    const decryptedData = decryptBinaryData(keyBuffer, encryptedFileBuffer);


    const originalFile = decodeBinaryToFile(decryptedData);


    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${originalFile.originalName}"`
    );
    res.setHeader("Content-Type", originalFile.mimeType);

    res.send(originalFile.fileBuffer);

  } catch (error) {
    console.error("An error occurred during file decoding:", error.message);

    if (error.message.includes("File not found")) {
        return res.status(404).json({ message: "The encrypted file could not be found." });
    }
    if (error.message.includes("Invalid file ID format")) {
        return res.status(400).json({ message: "The provided file ID is invalid." });
    }
    if (
      error.message.includes("Unsupported state") || // crypto error
      error.message.includes("auth") || // crypto error
      error.message.includes("Invalid message length") || // stego error
      error.message.includes("Invalid key length") // crypto error
    ) {
      return res
        .status(400)
        .json({
          message:
            "Decryption failed. The key-image may be incorrect or the file may be corrupt.",
        });
    }

    next(error);
  }
};

module.exports = {
  processFile,
  decryptBinaryData,
  decodeBinaryToFile,
};

