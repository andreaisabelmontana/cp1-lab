import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encode, bitsToUnsigned, bitsToSigned, range, bitOp } from '../src/bits.js';

test('encode produces big-endian bits', () => {
  assert.deepEqual(encode(42, 8, false), [0, 0, 1, 0, 1, 0, 1, 0]); // 0x2A
  assert.deepEqual(encode(0, 8, false), [0, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(encode(255, 8, false), [1, 1, 1, 1, 1, 1, 1, 1]);
});

test('encode is the inverse of bitsToUnsigned', () => {
  for (let v = 0; v < 256; v++) {
    assert.equal(bitsToUnsigned(encode(v, 8, false)), v);
  }
});

test("two's complement encodes negatives", () => {
  assert.deepEqual(encode(-1, 8, true), [1, 1, 1, 1, 1, 1, 1, 1]);
  assert.deepEqual(encode(-128, 8, true), [1, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(bitsToSigned(encode(-1, 8, true)), -1);
  assert.equal(bitsToSigned(encode(-128, 8, true)), -128);
  assert.equal(bitsToSigned(encode(127, 8, true)), 127);
});

test('range reports representable bounds', () => {
  assert.deepEqual(range(8, false), { lo: 0, hi: 255 });
  assert.deepEqual(range(8, true), { lo: -128, hi: 127 });
  assert.deepEqual(range(4, true), { lo: -8, hi: 7 });
});

test('bitwise and / or / xor against a mask', () => {
  assert.equal(bitOp('and', 0b1100, 0b1010, 8), 0b1000);
  assert.equal(bitOp('or', 0b1100, 0b1010, 8), 0b1110);
  assert.equal(bitOp('xor', 0b1100, 0b1010, 8), 0b0110);
});

test('shifts wrap to the field width', () => {
  assert.equal(bitOp('shl', 1, 0, 8), 2);
  assert.equal(bitOp('shl', 128, 0, 8), 0);   // overflow drops the top bit
  assert.equal(bitOp('shr', 5, 0, 8), 2);     // floor(5/2)
  assert.equal(bitOp('shr', 1, 0, 8), 0);
});

test('unknown op is rejected', () => {
  assert.throws(() => bitOp('rol', 1, 1, 8), /unknown/);
});
