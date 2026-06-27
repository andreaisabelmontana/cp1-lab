# cp1-lab

Interactive companion for **Computer Programming I** (BCSAI, IE University). Eleven self-contained canvas demos covering the C-language core of the course: variables, expressions, control flow, recursion, pointers, search, sorting, linked lists, bits, backtracking and struct layout.

**Live:** https://andreaisabelmontana.github.io/cp1-lab/

## What's tested

The genuinely-algorithmic parts of the demos live in framework-free ES modules under [`src/`](src/) — no DOM, no dependencies. `index.html` loads `src/app.js`, which imports these modules and keeps only rendering and control wiring. Each module is unit-tested with Node's built-in runner.

| Module | Algorithm | Properties proven by the tests |
| --- | --- | --- |
| `src/trace.js` | step-snapshot programs: swap, digit sum, integer power | swap exchanges values; digit sum 4093 → 16, 0 → 0; `b^e` incl. `b^0 = 1` |
| `src/expr.js` | recursive-descent arithmetic parser + int/double evaluator | `*` binds tighter than `+`; parens override; left-associativity; C int division truncates (`7/2 = 3` vs `3.5`); parse errors caught |
| `src/loops.js` | counted-loop accumulator (sum / product / squares) | `Σ1..5 = 15`, `5! = 120`, `Σi² = 14`; empty loop returns the identity; step skips values |
| `src/recursion.js` | factorial, Fibonacci, gcd as call trees | known values; factorial makes *n* calls of depth *n*; naive `fib(5)` makes 15 calls; gcd = Euclid |
| `src/search.js` | linear & binary search on a sorted array | finds present elements, returns `-1` when absent; empty/single arrays; binary stays within `⌈log₂n⌉+1` probes; both agree |
| `src/sorting.js` | bubble / selection / insertion sort | sorts incl. empty/single/reversed/duplicates; input never mutated; sorted input → 0 swaps; all three agree |
| `src/bits.js` | fixed-width binary encoding + bitwise ops | `encode`/decode round-trip 0..255; two's-complement `-1`, `-128`; `& \| ^`; shifts wrap to width |
| `src/structs.js` | C struct alignment / padding / `sizeof` | `{char,int,double}` → 16 B (3 pad); reorder changes layout; tail-padding to largest member |
| `src/queens.js` | N-Queens backtracking | finds valid placements for n = 4..8; n = 2,3 unsolvable; solution counts match OEIS A000170 (1,0,0,2,10,4,40,92) |

The search / sorting / queens animations keep their own step-by-step state machines for the visualisation; the modules above are the underlying algorithms those state machines mirror, verified independently.

## Run

Static site, no build step — open `index.html`, or serve the folder:

```sh
python -m http.server   # then visit http://localhost:8000
```

## Test

Node 24+, no dependencies:

```sh
node --test
```

```
ℹ tests 78
ℹ suites 0
ℹ pass 78
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

Plain HTML + canvas + KaTeX. Indigo accent.

Part of the *-lab series: [discrete-math-lab](https://github.com/andreaisabelmontana/discrete-math-lab) · [algos-lab](https://github.com/andreaisabelmontana/algos-lab) · [programming-principles-lab](https://github.com/andreaisabelmontana/programming-principles-lab)
