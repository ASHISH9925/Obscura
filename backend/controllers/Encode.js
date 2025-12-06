const fs = require("fs");
const crypto = require("crypto");
const { uploadFile } = require("./FileHandlers");
const { getEncryptImage } = require("./ImageSteganography");

/**
 * Pack filename, MIME type, and file bytes into a single buffer.
 * Format: <name>\n<mime>\n<bytes>
 * @param {string} originalName
 * @param {string} mimeType
 * @param {Buffer} fileBuffer
 * @returns {Buffer}
 */
function encodeFileToBinary(originalName, mimeType, fileBuffer) {
  const nameBuffer = Buffer.from(originalName, "utf8");
  const mimeBuffer = Buffer.from(mimeType, "utf8");
  const newline = Buffer.from("\n", "utf8");

  const result = Buffer.concat([
    nameBuffer,
    newline,
    mimeBuffer,
    newline,
    fileBuffer,
  ]);

  return result;
}

/**
 * Encrypt a buffer using AES-256-GCM with a random key and IV.
 * Output: 12-byte IV | ciphertext | 16-byte auth tag
 * @param {Buffer} data
 * @returns {{ key: Buffer, encryptedData: Buffer }}
 */
function encryptBinaryData(data) {
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const encryptedData = Buffer.concat([iv, encrypted, authTag]);

  return {
    key: key,
    encryptedData: encryptedData,
  };
}

/**
 * Express handler to encode and encrypt an uploaded file, hide the AES key in a PNG,
 * upload the encrypted bytes, and return the file ID with the key image.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {Promise<void>}
 */
const processFile = async (req, res, next) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "No file was uploaded. Please select a file." });
  }
  if (!req.body.expiryMinutes) {
    return res.status(400).json({ message: "The expiry time is missing." });
  }
  try {
    const inputFileBuffer = req.file.buffer;
    const originalFileName = req.file.originalname;
    const mimeType = req.file.mimetype;
   
    const expiryMinutes = Number(req.body.expiryMinutes);
    if (!Number.isFinite(expiryMinutes) || expiryMinutes <= 0) {
      return res.status(400).json({ message: "The expiry time must be a positive number (minutes)." });
    }

    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    if (inputFileBuffer.length > (15 * 1024 * 1024)) {
      return res.status(400).json({
        message:
          "File size must be under 15MB due to MongoDB storage limits",
      });
    }

    const binary_file = encodeFileToBinary(
      originalFileName,
      mimeType,
      inputFileBuffer
    );

    const processedFileBuffer = encryptBinaryData(binary_file);
    
    const keyAsHexString = processedFileBuffer.key.toString('hex');
    const imageBuffer = await getEncryptImage(keyAsHexString);

    const stegoImageBase64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    
    const fileId = await uploadFile(processedFileBuffer.encryptedData, mimeType, expiresAt);

    res.status(200).json({
        message: "File successfully encrypted and key hidden!",
        fileId: fileId,
        accessUrl: `/file/${fileId}`, 
        keyImageDataUrl: stegoImageBase64,
        keyImageName: "your-secret-key-file.png"
    });

  } catch (error) {
    console.error("An error occurred during file processing:", error);
    next(error);
  }
};

module.exports = processFile;