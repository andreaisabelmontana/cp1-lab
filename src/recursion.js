// Recursion demos (demo 4): factorial, Fibonacci and gcd.
// Each builder returns a call-tree node { label, value, children } and counts
// the calls made and the maximum stack depth reached, so the page can render
// the tree and report cost. The returned `value` is the function's result.

function buildFact(k, ctx) {
  ctx.calls++;
  const node = { label: `f(${k})`, children: [] };
  if (k <= 1) { node.value = 1; return node; }
  const c = buildFact(k - 1, ctx);
  node.children.push(c);
  node.value = k * c.value;
  return node;
}

function buildFib(k, ctx) {
  ctx.calls++;
  const node = { label: `f(${k})`, children: [] };
  if (k < 2) { node.value = k; return node; }
  const a = buildFib(k - 1, ctx), b = buildFib(k - 2, ctx);
  node.children.push(a, b);
  node.value = a.value + b.value;
  return node;
}

function buildGcd(a, b, ctx) {
  ctx.calls++;
  const node = { label: `g(${a},${b})`, children: [] };
  if (b === 0) { node.value = a; return node; }
  const c = buildGcd(b, a % b, ctx);
  node.children.push(c);
  node.value = c.value;
  return node;
}

// Compute the depth (number of levels) of a call tree; a single node is depth 1.
export function treeDepth(node) {
  if (!node.children.length) return 1;
  return 1 + Math.max(...node.children.map(treeDepth));
}

export function factorial(n) {
  const ctx = { calls: 0 };
  const tree = buildFact(n, ctx);
  return { value: tree.value, calls: ctx.calls, depth: treeDepth(tree), tree };
}

export function fib(n) {
  const ctx = { calls: 0 };
  const tree = buildFib(n, ctx);
  return { value: tree.value, calls: ctx.calls, depth: treeDepth(tree), tree };
}

export function gcd(a, b) {
  const ctx = { calls: 0 };
  const tree = buildGcd(a, b, ctx);
  return { value: tree.value, calls: ctx.calls, depth: treeDepth(tree), tree };
}
