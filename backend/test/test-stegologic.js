const assert = require('assert');
const StegoLogic = require('../controllers/StegoLogic');

function run() {
  console.log('Running StegoLogic unit tests...');

  // Test 1: basic hide/show roundtrip
  const message = 'hello-world';
  const requiredBits = 32 + message.length * 8;
  const buf = Buffer.alloc(requiredBits + 16, 0);

  const modified = StegoLogic.hide(buf, message);
  const extracted = StegoLogic.show(modified);

  try {
    assert.strictEqual(extracted, message, 'Extracted message should match original');
    console.log('✔ hide/show roundtrip: PASS');
  } catch (err) {
    console.error('✖ hide/show roundtrip: FAIL');
    console.error(err);
    process.exit(1);
  }

  // Test 2: too small buffer should throw
  const small = Buffer.alloc(10, 0);
  let threw = false;
  try {
    StegoLogic.hide(small, 'abc');
  } catch (e) {
    threw = true;
  }

  try {
    assert.strictEqual(threw, true, 'hide should throw on insufficient buffer size');
    console.log('✔ hide throws on small buffer: PASS');
  } catch (err) {
    console.error('✖ hide throws on small buffer: FAIL');
    console.error(err);
    process.exit(1);
  }

  // Test 3: corrupted buffer - show should throw for invalid length
  const corrupt = Buffer.alloc(40, 0);
  // set length header to a huge number
  corrupt[0] = 0xff;
  corrupt[1] = 0xff;
  corrupt[2] = 0xff;
  corrupt[3] = 0xff;
  let threw2 = false;
  try {
    StegoLogic.show(corrupt);
  } catch (e) {
    threw2 = true;
  }

  try {
    assert.strictEqual(threw2, true, 'show should throw on corrupted/invalid length');
    console.log('✔ show throws on corrupted data: PASS');
  } catch (err) {
    console.error('✖ show throws on corrupted data: FAIL');
    console.error(err);
    process.exit(1);
  }

  console.log('All StegoLogic tests passed.');
}

run();
