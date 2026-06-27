// N-Queens backtracking (demo 10).
// `cols[c] = r` means a queen sits in column c, row r. The page steps a solver
// one column at a time; here we expose both the safety test and a complete
// solver so results can be checked against known counts.

// Is it safe to place a queen at (col, row) given queens already in cols[0..col-1]?
export function safe(cols, col, row) {
  for (let pc = 0; pc < col; pc++) {
    const pr = cols[pc];
    if (pr === row || Math.abs(pr - row) === Math.abs(pc - col)) return false;
  }
  return true;
}

// First solution found by column-by-column backtracking, or null if none.
// Also reports how many backtracks (column undos) were needed.
export function solve(n) {
  const cols = [];
  let backtracks = 0;
  let col = 0, row = 0;
  while (col < n) {
    let r = row;
    while (r < n && !safe(cols, col, r)) r++;
    if (r < n) { cols[col] = r; col++; row = 0; }
    else {
      if (col === 0) return { solution: null, backtracks };
      col--; backtracks++;
      row = cols[col] + 1;
      cols.length = col;
    }
  }
  return { solution: cols.slice(), backtracks };
}

// Count all distinct solutions for an n x n board.
export function countSolutions(n) {
  const cols = [];
  let count = 0;
  (function place(col) {
    if (col === n) { count++; return; }
    for (let r = 0; r < n; r++) {
      if (safe(cols, col, r)) { cols[col] = r; place(col + 1); }
    }
  })(0);
  return count;
}

// Verify a full placement has no two queens attacking each other.
export function isValidSolution(cols, n) {
  if (cols.length !== n) return false;
  for (let c = 0; c < n; c++) {
    if (cols[c] < 0 || cols[c] >= n) return false;
    if (!safe(cols, c, cols[c])) return false;
  }
  return true;
}
