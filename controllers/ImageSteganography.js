const sharp = require("sharp");
const StegoLogic = require("./StegoLogic.js");

/**
// converts url from api to actual image buffer
// @param {string} imageurl - the url of the image example - "https://something.png"
// @returns {Buffer} the image in form of a node buffer 
**/
async function fetchImageInBuffer(imageurl) {
  const response = await fetch(imageurl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const imageArrayBuffer = await response.arrayBuffer();

  const imageBuffer = Buffer.from(imageArrayBuffer);

  return imageBuffer;
}

/**
// Fetches a random dog image and hides an AES key inside it
// @param {string} aesKey - the key used to cypher the orignal document
// @returns {Buffer} a random dog image with the key encrypted in it
**/
async function getEncryptImage(aesKey) {
  try {
    const apiKey = process.env.APIKEY;
    const apiUrl = "https://api.pexels.com/v1/search?query=dog";
    const apiResponse = await fetch(apiUrl, {
      method: "GET",
      headers: { Authorization: apiKey },
    });

    const data = await apiResponse.json();
    const randomPhoto =
      data.photos[Math.floor(Math.random() * data.photos.length)];

    const ImageBuffer = await fetchImageInBuffer(randomPhoto.src.original);

    // Converting file in RAW pixel data
    const sharpImg = sharp(ImageBuffer);
    const metadata = await sharpImg.metadata();

    // .ensureAlpha() makes sure we have 4 channels (RGBA)
    const rawBuffer = await sharpImg.ensureAlpha().raw().toBuffer();

    // Hide the message in the raw pixel data
    const modifiedRawBuffer = StegoLogic.hide(rawBuffer, aesKey);

    // Re-encode the modified raw data back into a PNG
    const finalPngBuffer = await sharp(modifiedRawBuffer, {
      raw: {
        width: metadata.width,
        height: metadata.height,
        channels: 4,
      },
    })
      .png()
      .toBuffer();

    return finalPngBuffer;
  } catch (error) {
    console.error("An error occurred during processing:", error);
    throw new Error("Failed to encrypt image: " + error.message);
  }
}

/**
// Extracts the hidden AES key from an image buffer
// @param {Buffer} ImageBuffer - the buffer which contains the aes key to the file in it 
// @returns {object} an object containing the original aes key { aesKey: "..." }
**/
async function decryptImage(ImageBuffer) {
  try {
    const sharpImg = sharp(ImageBuffer);
    const rawBuffer = await sharpImg.ensureAlpha().raw().toBuffer();
    const decryptedMessage = StegoLogic.show(rawBuffer);

    return {
      aesKey: decryptedMessage,
    };
  } catch (error) {
    console.log(error);
    throw new Error("Failed to decrypt image: " + error.message);
  }
}


module.exports = {
    getEncryptImage,
    decryptImage
}