import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokenize, parse, evalNode, evaluate } from '../src/expr.js';

test('tokenize reads numbers and operators', () => {
  assert.deepEqual(tokenize('12 + 3'), [{ t: 'num', v: 12 }, { t: '+' }, { t: 'num', v: 3 }]);
  assert.deepEqual(tokenize('1.5*2'), [{ t: 'num', v: 1.5 }, { t: '*' }, { t: 'num', v: 2 }]);
});

test('tokenize rejects unknown characters', () => {
  assert.throws(() => tokenize('1 & 2'), /unexpected/);
});

test('precedence: multiplication binds tighter than addition', () => {
  assert.equal(evaluate('2 + 3 * 4', false), 14);
  assert.equal(evaluate('2 * 3 + 4', false), 10);
});

test('parentheses override precedence', () => {
  assert.equal(evaluate('(2 + 3) * 4', false), 20);
});

test('left associativity of subtraction and division', () => {
  assert.equal(evaluate('10 - 3 - 2', false), 5);
  assert.equal(evaluate('100 / 5 / 2', false), 10);
});

test('unary minus', () => {
  assert.equal(evaluate('-5 + 2', false), -3);
  assert.equal(evaluate('3 * -2', false), -6);
});

test('int mode truncates division and operands', () => {
  // C: 7 / 2 == 3 ; double: 3.5
  assert.equal(evaluate('7 / 2', true), 3);
  assert.equal(evaluate('7 / 2', false), 3.5);
  // the lab's default expression
  assert.equal(evaluate('2 + 3 * 4 - 14 / 4', true), 11);   // 2 + 12 - 3
  assert.equal(evaluate('2 + 3 * 4 - 14 / 4', false), 10.5); // 2 + 12 - 3.5
});

test('modulo', () => {
  assert.equal(evaluate('17 % 5', true), 2);
  assert.equal(evaluate('17 % 5', false), 2);
});

test('parse errors are reported', () => {
  assert.throws(() => parse(tokenize('(1 + 2')), /missing \)/);
  assert.throws(() => parse(tokenize('1 2')), /trailing/);
  assert.throws(() => parse(tokenize('1 +')), /unexpected end/);
});

test('parse produces an expected AST shape', () => {
  const tree = parse(tokenize('1 + 2'));
  assert.equal(tree.op, '+');
  assert.equal(evalNode(tree, false), 3);
});
