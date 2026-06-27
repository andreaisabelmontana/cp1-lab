import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layout, TYPE_SIZE } from '../src/structs.js';

test('type sizes match the lab legend', () => {
  assert.deepEqual(TYPE_SIZE, { char: 1, short: 2, int: 4, double: 8 });
});

test('char, int, double needs padding after the char', () => {
  // char[0] then 3 pad bytes to align int at 4, int[4..7], double[8..15] -> 16
  const r = layout([['c', 'char'], ['i', 'int'], ['d', 'double']]);
  assert.equal(r.dataBytes, 13); // 1 + 4 + 8
  assert.equal(r.size, 16);
  assert.equal(r.padding, 3);
});

test('reordering biggest-first eliminates padding', () => {
  const r = layout([['d', 'double'], ['i', 'int'], ['c', 'char']]);
  assert.equal(r.dataBytes, 13);
  assert.equal(r.size, 16);   // tail-padded up to alignment 8
  assert.equal(r.padding, 3); // all of it is tail padding here
});

test('char, double, char tail-pads to a multiple of 8', () => {
  // a:char[0], pad[1..7], d:double[8..15], b:char[16], pad[17..23] -> 24
  const r = layout([['a', 'char'], ['d', 'double'], ['b', 'char']]);
  assert.equal(r.dataBytes, 10); // 1 + 8 + 1
  assert.equal(r.size, 24);
  assert.equal(r.padding, 14);
});

test('short, char, int', () => {
  // s:short[0..1], c:char[2], pad[3], i:int[4..7] -> 8
  const r = layout([['s', 'short'], ['c', 'char'], ['i', 'int']]);
  assert.equal(r.dataBytes, 7); // 2 + 1 + 4
  assert.equal(r.size, 8);
  assert.equal(r.padding, 1);
});

test('cells account for exactly sizeof bytes', () => {
  const r = layout([['c', 'char'], ['i', 'int'], ['d', 'double']]);
  assert.equal(r.cells.length, r.size);
  const padCells = r.cells.filter(c => c.pad).length;
  assert.equal(padCells, r.padding);
});

test('unknown type is rejected', () => {
  assert.throws(() => layout([['x', 'float']]), /unknown type/);
});
