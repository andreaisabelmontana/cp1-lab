// Variable-tracing programs (demo 1).
// Each program runs pure integer arithmetic and returns an ordered list of
// snapshots { line, vars, done? } describing the machine state at each step.
// This is the exact stepping logic the canvas walks through, with no DOM.

// swap two ints via a temporary
export function traceSwap() {
  const snaps = [];
  let a = 3, b = 8, t;
  snaps.push({ line: 0, vars: { a, b } });
  t = a;       snaps.push({ line: 1, vars: { a, b, t } });
  a = b;       snaps.push({ line: 2, vars: { a, b, t } });
  b = t;       snaps.push({ line: 3, vars: { a, b, t } });
  snaps.push({ line: 4, vars: { a, b, t }, done: true });
  return snaps;
}

// sum of the decimal digits of a number, by repeated %10 and /10
export function traceSumDigits(start = 4093) {
  const snaps = [];
  let x = start, s = 0;
  snaps.push({ line: 0, vars: { x, s } });
  while (x > 0) {
    snaps.push({ line: 1, vars: { x, s } });
    s += x % 10;            snaps.push({ line: 2, vars: { x, s } });
    x = Math.floor(x / 10); snaps.push({ line: 3, vars: { x, s } });
  }
  snaps.push({ line: 1, vars: { x, s } });
  snaps.push({ line: 5, vars: { x, s }, done: true });
  return snaps;
}

// integer power b^e via a counted loop
export function tracePow(b = 2, e = 5) {
  const snaps = [];
  let r = 1;
  snaps.push({ line: 0, vars: { b, e } });
  snaps.push({ line: 1, vars: { b, e, r } });
  for (let i = 0; i < e; i++) {
    snaps.push({ line: 2, vars: { b, e, r, i } });
    r *= b; snaps.push({ line: 3, vars: { b, e, r, i } });
  }
  snaps.push({ line: 2, vars: { b, e, r, i: e } });
  snaps.push({ line: 4, vars: { b, e, r }, done: true });
  return snaps;
}

// The final value a traced program leaves in its result variable.
export function finalValue(snaps, key) {
  const last = snaps[snaps.length - 1];
  return last ? last.vars[key] : undefined;
}
