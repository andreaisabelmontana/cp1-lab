import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runLoop } from '../src/loops.js';

test('sum accumulates i over the range', () => {
  // i = 1,2,3,4,5 -> 15
  const r = runLoop(1, 6, 1, 'sum');
  assert.equal(r.acc, 15);
  assert.equal(r.iterations, 5);
  assert.deepEqual(r.rows.map(x => x.i), [1, 2, 3, 4, 5]);
  assert.deepEqual(r.rows.map(x => x.acc), [1, 3, 6, 10, 15]);
});

test('product (factorial-style) multiplies i over the range', () => {
  // i = 1..5 -> 120
  assert.equal(runLoop(1, 6, 1, 'fact').acc, 120);
  // starting at 0 multiplies by 1 (treated as identity), then 1..4
  assert.equal(runLoop(0, 5, 1, 'fact').acc, 24);
});

test('squares accumulate i*i', () => {
  // 1 + 4 + 9 = 14
  assert.equal(runLoop(1, 4, 1, 'sq').acc, 14);
});

test('step skips values', () => {
  // i = 0,2,4 -> 0+4+16 = 20 for squares
  const r = runLoop(0, 6, 2, 'sq');
  assert.deepEqual(r.rows.map(x => x.i), [0, 2, 4]);
  assert.equal(r.acc, 20);
});

test('empty loop when condition is false at the start', () => {
  const r = runLoop(6, 6, 1, 'sum');
  assert.equal(r.iterations, 0);
  assert.equal(r.acc, 0);          // additive identity
  assert.equal(runLoop(6, 6, 1, 'fact').acc, 1); // multiplicative identity
});

test('non-positive step is rejected', () => {
  assert.throws(() => runLoop(1, 6, 0, 'sum'), /step/);
});

test('unknown loop body is rejected', () => {
  assert.throws(() => runLoop(1, 6, 1, 'nope'), /unknown/);
});
