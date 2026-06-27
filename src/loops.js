// Counted-loop accumulator (demo 3).
// Models a C for-loop `for (i = a; i < lim; i += step)` running one of three
// loop bodies and recording the accumulator after every iteration.
//   sum  -> acc += i
//   fact -> acc *= i   (treating i == 0 as a multiply by 1)
//   sq   -> acc += i*i

const MAX_ROWS = 40;

export function runLoop(a, lim, step, kind) {
  if (step <= 0) throw new Error('step must be positive');
  const rows = [];
  let acc = kind === 'fact' ? 1 : 0;
  for (let i = a; i < lim; i += step) {
    if (kind === 'sum') acc += i;
    else if (kind === 'fact') acc *= (i === 0 ? 1 : i);
    else if (kind === 'sq') acc += i * i;
    else throw new Error(`unknown kind ${kind}`);
    rows.push({ i, acc });
    if (rows.length >= MAX_ROWS) break;
  }
  return { rows, acc, iterations: rows.length };
}
