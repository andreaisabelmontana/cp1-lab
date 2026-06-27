import { test } from 'node:test';
import assert from 'node:assert/strict';
import { traceSwap, traceSumDigits, tracePow, finalValue } from '../src/trace.js';

test('swap exchanges the two values', () => {
  const snaps = traceSwap();
  assert.equal(finalValue(snaps, 'a'), 8);
  assert.equal(finalValue(snaps, 'b'), 3);
  assert.equal(snaps[snaps.length - 1].done, true);
});

test('swap snapshots advance one line at a time at the start', () => {
  const snaps = traceSwap();
  assert.deepEqual(snaps.map(s => s.line), [0, 1, 2, 3, 4]);
});

test('sum of digits matches the hand-computed digit sum', () => {
  // 4 + 0 + 9 + 3 = 16
  assert.equal(finalValue(traceSumDigits(4093), 's'), 16);
  assert.equal(finalValue(traceSumDigits(0 + 7), 's'), 7);
  assert.equal(finalValue(traceSumDigits(999), 's'), 27);
});

test('sum of digits of 0 is 0 and runs the body zero times', () => {
  const snaps = traceSumDigits(0);
  assert.equal(finalValue(snaps, 's'), 0);
  // no line-2 (accumulate) snapshot when the while body never runs
  assert.ok(!snaps.some(s => s.line === 2));
});

test('integer power computes b^e', () => {
  assert.equal(finalValue(tracePow(2, 5), 'r'), 32);
  assert.equal(finalValue(tracePow(3, 0), 'r'), 1); // empty product
  assert.equal(finalValue(tracePow(5, 1), 'r'), 5);
  assert.equal(finalValue(tracePow(2, 10), 'r'), 1024);
});

test('every program ends with a done snapshot', () => {
  for (const snaps of [traceSwap(), traceSumDigits(12), tracePow(2, 3)]) {
    assert.equal(snaps[snaps.length - 1].done, true);
  }
});
