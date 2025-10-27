const fs = require("fs");
const crypto = require("crypto");

function encodeFileToBinary(originalName, mimeType, fileBuffer) {
  const nameBuffer = Buffer.from(originalName, "utf8");
  const mimeBuffer = Buffer.from(mimeType, "utf8");
  const newline = Buffer.from("\n", "utf8");

  // Concatenate all parts with newlines
  const result = Buffer.concat([
    nameBuffer,
    newline,
    mimeBuffer,
    newline,
    fileBuffer,
  ]);

  return result;
}

function encryptBinaryData(data) {
  // Generate a random 256-bit (32 bytes) encryption key
  const key = crypto.randomBytes(32);
  // Generate a random 96-bit (12 bytes) initialization vector
  const iv = crypto.randomBytes(12);
  // Create cipher
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  // Encrypt the data
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  // Get the authentication tag (16 bytes)
  const authTag = cipher.getAuthTag();
  // Combine IV + encrypted data + auth tag into single buffer
  // This format makes decryption easier as everything is in one package
  const encryptedData = Buffer.concat([iv, encrypted, authTag]);

  return {
    key: key,
    encryptedData: encryptedData,
  };
}

const processFile = async (req, res, next) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "No file was uploaded. Please select a file." });
  }
  try {
    const inputFileBuffer = req.file.buffer;
    const originalFileName = req.file.originalname;
    const mimeType = req.file.mimetype;

    if (inputFileBuffer.length > 100000000) {
      return res.status(400).json({
        message:
          "The entered file was larger than 100mb please try a smaller file",
      });
    }

    const binary_file = encodeFileToBinary(
      originalFileName,
      mimeType,
      inputFileBuffer
    );
    const processedFileBuffer = encryptBinaryData(binary_file);
    const encryptedFileName = `encrypted-${originalFileName}.txt`;

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encryptedFileName}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");
    res.send(processedFileBuffer.encryptedData);

    console.log(processedFileBuffer.key.toString("hex"));
  } catch (error) {
    console.error("An error occurred during file processing:", error);
    next(error);
  }
};

module.exports = processFile;
