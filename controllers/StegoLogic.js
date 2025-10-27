/**
 * Hides a secret message in a raw pixel buffer.
 * @param {Buffer} rawBuffer - The raw RGBA pixel data.
 * @param {string} message - The message to hide.
 * @returns {Buffer} A new buffer with the message hidden.
 */
function hide(rawBuffer, message) {
  const modifiedBuffer = Buffer.from(rawBuffer);
  const messageBuffer = Buffer.from(message, "utf8");

  const requiredBits = 32 + messageBuffer.length * 8;
  if (requiredBits > modifiedBuffer.length) {
    throw new Error("Image is not large enough to hold this message.");
  }

  let offset = 0;

  const msgLen = messageBuffer.length;
  for (let i = 0; i < 32; i++) {
    const bit = (msgLen >> i) & 1;
    modifiedBuffer[offset] = (modifiedBuffer[offset] & 0xfe) | bit;
    offset++;
  }

  for (let i = 0; i < msgLen; i++) {
    const charByte = messageBuffer[i];

    for (let j = 0; j < 8; j++) {
      const bit = (charByte >> j) & 1;
      modifiedBuffer[offset] = (modifiedBuffer[offset] & 0xfe) | bit;
      offset++;
    }
  }

  return modifiedBuffer;
}

/**
 * Extracts a hidden message from a raw pixel buffer.
 * @param {Buffer} rawBuffer - The raw RGBA pixel data.
 * @returns {string} The hidden message.
 */
function show(rawBuffer) {
  let offset = 0;

  let msgLen = 0;
  for (let i = 0; i < 32; i++) {
    const bit = rawBuffer[offset] & 1;
    msgLen = msgLen | (bit << i);
    offset++;
  }

  if (msgLen < 0 || msgLen * 8 + 32 > rawBuffer.length) {
    throw new Error("Invalid message length or corrupted data.");
  }

  const messageBuffer = Buffer.alloc(msgLen);
  for (let i = 0; i < msgLen; i++) {
    let charByte = 0;

    for (let j = 0; j < 8; j++) {
      const bit = rawBuffer[offset] & 1;
      charByte = charByte | (bit << j);
      offset++;
    }
    messageBuffer[i] = charByte;
  }
//   console.log("from the decrypt function --> "+messageBuffer.toString("utf8"));
  
  return messageBuffer.toString("utf8");
}

module.exports = {
  hide,
  show,
};
