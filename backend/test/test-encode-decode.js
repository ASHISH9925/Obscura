const assert = require('assert');
const crypto = require('crypto');
const { decryptBinaryData, decodeBinaryToFile } = require('../controllers/Decode');

async function run() {
  console.log('Running encode/decode roundtrip test...');

  const originalName = 'example.txt';
  const mimeType = 'text/plain';
  const payload = Buffer.from('This is a test payload.');

  // Build the binary format used by Encode.encodeFileToBinary: name\nmime\n<bytes>
  const newline = Buffer.from('\n', 'utf8');
  const buf = Buffer.concat([Buffer.from(originalName, 'utf8'), newline, Buffer.from(mimeType, 'utf8'), newline, payload]);

  // Encrypt using the same scheme: 12-byte IV | ciphertext | 16-byte auth tag
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(buf), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const encryptedData = Buffer.concat([iv, encrypted, authTag]);

  // Now decrypt using Decode.decryptBinaryData
  let decrypted;
  try {
    decrypted = decryptBinaryData(key, encryptedData);
  } catch (err) {
    console.error('Decryption failed:', err);
    process.exit(1);
  }

  // Decode binary back to fields
  const decoded = decodeBinaryToFile(decrypted);

  try {
    assert.strictEqual(decoded.originalName, originalName, 'Original filename should match');
    assert.strictEqual(decoded.mimeType, mimeType, 'MIME type should match');
    assert.strictEqual(decoded.fileBuffer.toString(), payload.toString(), 'Payload should match');

    console.log('✔ encode/decode roundtrip: PASS');
  } catch (err) {
    console.error('✖ encode/decode roundtrip: FAIL');
    console.error(err);
    process.exit(1);
  }

  console.log('Encode/Decode test passed.');
}

run();
