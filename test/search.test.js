import { test } from 'node:test';
import assert from 'node:assert/strict';
import { linearSearch, binarySearch } from '../src/search.js';

const A = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]; // sorted ascending

for (const [name, search] of [['linear', linearSearch], ['binary', binarySearch]]) {
  test(`${name}: finds a present element and reports its index`, () => {
    assert.equal(search(A, 2).index, 0);   // first
    assert.equal(search(A, 16).index, 4);  // middle
    assert.equal(search(A, 91).index, 9);  // last
  });

  test(`${name}: reports -1 when the target is absent`, () => {
    assert.equal(search(A, 1).index, -1);   // below range
    assert.equal(search(A, 100).index, -1); // above range
    assert.equal(search(A, 17).index, -1);  // gap in the middle
  });

  test(`${name}: empty and single-element arrays`, () => {
    assert.equal(search([], 5).index, -1);
    assert.equal(search([5], 5).index, 0);
    assert.equal(search([5], 9).index, -1);
  });

  test(`${name}: probes only ever index inside the array`, () => {
    const { probes } = search(A, 23);
    for (const p of probes) assert.ok(p >= 0 && p < A.length);
  });
}

test('binary search probes no more than ceil(log2(n))+1 cells', () => {
  const big = Array.from({ length: 1000 }, (_, i) => i * 2);
  const { probes } = binarySearch(big, 1337); // absent
  assert.ok(probes.length <= Math.ceil(Math.log2(big.length)) + 1);
});

test('binary and linear agree on the found index for present targets', () => {
  for (const v of A) assert.equal(linearSearch(A, v).index, binarySearch(A, v).index);
});
