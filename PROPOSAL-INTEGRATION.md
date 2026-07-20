# Proposal: passphrase-wrapped key (not merge-ready)

This branch adds `backend/controllers/KeyWrap.js` and a standalone test. It is a
**reference implementation** of the fix for the "key recoverable from the stego
image" issue. It is NOT wired into the request flow and has NOT been run in this
repo's CI/environment — review and test before merging.

## Why

The AES file-key is currently hidden in the PNG via a public LSB scheme
(`StegoLogic.hide`). Steganography is concealment, not encryption — anyone with
the key image recovers the key. Wrapping the key under a user passphrase before
hiding it makes the key image useless on its own.

## What to change to wire it in

1. **`backend/controllers/Encode.js`** — after computing `keyAsHexString`, wrap
   it before steganography:

   ```js
   const { wrapKey } = require("./KeyWrap");
   // req.body.passphrase must be collected from the user (see frontend below)
   const wrapped = wrapKey(processedFileBuffer.key.toString("hex"), req.body.passphrase);
   const imageBuffer = await getEncryptImage(wrapped);   // hide the WRAPPED blob, not the raw key
   ```

2. **Decode controller** (the handler behind `POST /api/decode`) — after
   `decryptImage(...)` returns the hidden blob, unwrap it with the passphrase
   the user supplies on decode:

   ```js
   const { unwrapKey } = require("./KeyWrap");
   const { aesKey: wrapped } = await decryptImage(imageBuffer);
   const keyHex = unwrapKey(wrapped, req.body.passphrase); // throws on wrong passphrase
   ```

3. **API / frontend** — add a passphrase field to the upload and decode forms.
   The passphrase is never stored server-side; it is required again to decode.
   Update the README to drop the "unbreakable" claim and explain the passphrase.

4. **KDF choice** — `KeyWrap.js` uses Node's built-in `scrypt` (no new
   dependency). If you add the `argon2` package, switch `deriveKey()` to
   Argon2id for a stronger memory-hard KDF.

## Test

```bash
node backend/controllers/__tests__/KeyWrap.test.js
```
