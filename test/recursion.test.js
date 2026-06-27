import { test } from 'node:test';
import assert from 'node:assert/strict';
import { factorial, fib, gcd, treeDepth } from '../src/recursion.js';

test('factorial matches known values', () => {
  assert.equal(factorial(0).value, 1);
  assert.equal(factorial(1).value, 1);
  assert.equal(factorial(5).value, 120);
  assert.equal(factorial(7).value, 5040);
});

test('factorial makes one call per level and depth equals n (n>=1)', () => {
  // f(n) -> f(n-1) -> ... -> f(1): n calls, n levels
  assert.equal(factorial(5).calls, 5);
  assert.equal(factorial(5).depth, 5);
  assert.equal(factorial(0).calls, 1);
  assert.equal(factorial(0).depth, 1);
});

test('fib matches the Fibonacci sequence', () => {
  const seq = [0, 1, 1, 2, 3, 5, 8, 13];
  for (let i = 0; i < seq.length; i++) assert.equal(fib(i).value, seq[i]);
});

test('naive fib makes the expected (exponential) number of calls', () => {
  // calls(n) = 2*fib(n+1) - 1 for this two-recursive-call shape
  assert.equal(fib(0).calls, 1);
  assert.equal(fib(1).calls, 1);
  assert.equal(fib(5).calls, 15); // 2*fib(6)-1 = 2*8-1
});

test('gcd matches the Euclidean algorithm', () => {
  assert.equal(gcd(48, 36).value, 12);
  assert.equal(gcd(17, 5).value, 1);   // coprime
  assert.equal(gcd(100, 0).value, 100); // base case
  assert.equal(gcd(48, 18).value, 6);
});

test('treeDepth counts levels', () => {
  const leaf = { children: [] };
  assert.equal(treeDepth(leaf), 1);
  assert.equal(treeDepth({ children: [leaf, leaf] }), 2);
});
