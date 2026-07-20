// Minimal round-trip + tamper test for KeyWrap. Run with: node KeyWrap.test.js
// (no test framework required)
const assert = require("assert");
const crypto = require("crypto");
const { wrapKey, unwrapKey } = require("../KeyWrap.js");

const keyHex = crypto.randomBytes(32).toString("hex");
const pass = "correct horse battery staple";

// round-trip
const wrapped = wrapKey(keyHex, pass);
assert.strictEqual(unwrapKey(wrapped, pass), keyHex, "round-trip failed");

// wrong passphrase must fail (GCM tag)
assert.throws(() => unwrapKey(wrapped, "wrong"), "wrong passphrase should throw");

// different wraps of the same key differ (random salt+iv)
assert.notStrictEqual(wrapKey(keyHex, pass), wrapKey(keyHex, pass), "wraps should be non-deterministic");

// missing passphrase rejected
assert.throws(() => wrapKey(keyHex, ""), "empty passphrase should throw");

console.log("KeyWrap: all checks passed");
