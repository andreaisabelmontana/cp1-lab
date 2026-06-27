import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bubbleSort, selectionSort, insertionSort, SORTS } from '../src/sorting.js';

const sorts = Object.entries(SORTS);
const asc = (a, b) => a - b;

for (const [name, sort] of sorts) {
  test(`${name}: sorts a random array ascending`, () => {
    const input = [5, 2, 9, 1, 5, 6, 3, 8, 7, 4];
    const { sorted } = sort(input);
    assert.deepEqual(sorted, [...input].sort(asc));
  });

  test(`${name}: handles empty, single and two-element arrays`, () => {
    assert.deepEqual(sort([]).sorted, []);
    assert.deepEqual(sort([42]).sorted, [42]);
    assert.deepEqual(sort([2, 1]).sorted, [1, 2]);
  });

  test(`${name}: already-sorted stays sorted; reversed gets sorted`, () => {
    assert.deepEqual(sort([1, 2, 3, 4, 5]).sorted, [1, 2, 3, 4, 5]);
    assert.deepEqual(sort([5, 4, 3, 2, 1]).sorted, [1, 2, 3, 4, 5]);
  });

  test(`${name}: duplicates are preserved`, () => {
    const input = [3, 1, 3, 2, 1, 3];
    const { sorted } = sort(input);
    assert.deepEqual(sorted, [1, 1, 2, 3, 3, 3]);
    assert.equal(sorted.length, input.length);
  });

  test(`${name}: does not mutate the input`, () => {
    const input = [4, 2, 7, 1];
    const copy = [...input];
    sort(input);
    assert.deepEqual(input, copy);
  });

  test(`${name}: a sorted input needs zero swaps`, () => {
    assert.equal(sort([1, 2, 3, 4, 5]).swp, 0);
  });
}

test('all three algorithms agree on the result', () => {
  const input = [9, 3, 7, 1, 8, 2, 6, 4, 5, 0];
  const expected = [...input].sort(asc);
  assert.deepEqual(bubbleSort(input).sorted, expected);
  assert.deepEqual(selectionSort(input).sorted, expected);
  assert.deepEqual(insertionSort(input).sorted, expected);
});

test('counts are non-negative and comparisons happen on non-trivial input', () => {
  const r = bubbleSort([3, 1, 2]);
  assert.ok(r.cmp > 0);
  assert.ok(r.swp >= 0);
});
