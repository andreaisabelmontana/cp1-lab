import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safe, solve, countSolutions, isValidSolution } from '../src/queens.js';

test('safe rejects same row and diagonal conflicts', () => {
  // queen in column 0 at row 2
  assert.equal(safe([2], 1, 2), false); // same row
  assert.equal(safe([2], 1, 3), false); // diagonal (dc=1, dr=1)
  assert.equal(safe([2], 1, 1), false); // other diagonal
  assert.equal(safe([2], 1, 0), true);  // clear
});

test('solve finds a valid placement for solvable boards', () => {
  for (const n of [4, 5, 6, 7, 8]) {
    const { solution } = solve(n);
    assert.ok(solution, `expected a solution for n=${n}`);
    assert.ok(isValidSolution(solution, n));
  }
});

test('the classic 2x2 and 3x3 boards have no solution', () => {
  assert.equal(solve(2).solution, null);
  assert.equal(solve(3).solution, null);
});

test('countSolutions matches the known N-Queens sequence', () => {
  // OEIS A000170: 1,0,0,2,10,4,40,92 for n = 1..8
  assert.equal(countSolutions(1), 1);
  assert.equal(countSolutions(2), 0);
  assert.equal(countSolutions(3), 0);
  assert.equal(countSolutions(4), 2);
  assert.equal(countSolutions(5), 10);
  assert.equal(countSolutions(6), 4);
  assert.equal(countSolutions(7), 40);
  assert.equal(countSolutions(8), 92);
});

test('isValidSolution rejects malformed placements', () => {
  assert.equal(isValidSolution([0, 2], 3), false);     // wrong length
  assert.equal(isValidSolution([0, 1, 2], 3), false);  // all on a diagonal
  assert.equal(isValidSolution([1, 3, 0, 2], 4), true);
});
