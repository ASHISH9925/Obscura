const assert = require('assert');
const sharp = require('sharp');
const StegoLogic = require('../controllers/StegoLogic');
const ImageStego = require('../controllers/ImageSteganography');

async function run() {
  console.log('Running Image <-> Stego integration test...');

  const width = 16;
  const height = 16;
  const channels = 4;
  const total = width * height * channels;

  // create a raw RGBA buffer with deterministic content
  const raw = Buffer.alloc(total);
  for (let i = 0; i < total; i++) raw[i] = i % 256;

  const message = 'unit-test-key-123';

  // hide the message into the raw buffer
  const modified = StegoLogic.hide(raw, message);

  // encode to PNG via sharp
  const pngBuffer = await sharp(modified, { raw: { width, height, channels } }).png().toBuffer();

  try {
    const decrypted = await ImageStego.decryptImage(pngBuffer);
    assert.strictEqual(decrypted.aesKey, message, 'Decrypted AES key must match original');
    console.log('✔ decryptImage roundtrip (sharp + StegoLogic): PASS');
  } catch (err) {
    console.error('✖ decryptImage roundtrip: FAIL');
    console.error(err);
    process.exit(1);
  }

  console.log('Image stego integration test passed.');
}

run().catch((err) => {
  console.error('Test encountered an error:', err);
  process.exit(1);
});
