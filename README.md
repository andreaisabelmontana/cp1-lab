# cp1-lab

Visual C programming fundamentals. 11 self-contained demos, one per core idea from the IE BCSAI *Computer Programming I* course (C language: variables, control flow, functions, pointers, memory and data structures).

**Live:** https://andreaisabelmontana.github.io/cp1-lab/

Module 0 — C basics: variables, expressions, control flow
1. Variable tracing — step a short C program line by line and watch each variable update (swap, digit sum, integer power)
2. Expressions & operator precedence — parse a C arithmetic expression into an evaluation tree; compare `int` (truncating `/` `%`) vs `double` results
3. Loops — the iteration table: see `init ; condition ; update` produce one row per pass and grow an accumulator

Module 2/4 — Functions, recursion, pointers
4. Recursion & the call stack — call tree + depth for `factorial`, `fib` (showing repeated subproblems) and `gcd`
5. Pointers & memory — addresses, `&x`, `*p` and pointer arithmetic over an `int` array (`p + 1` advances by one element)

Algorithms & data structures
6. Linear vs binary search — step the probes on a sorted array; compare `O(n)` vs `O(log n)` step counts
7. Sorting — animated bubble / selection / insertion sort with live comparison and swap counters
8. Linked lists — singly linked nodes; insert at head/tail, delete by value, watch `next` pointers re-wire

Module 4 — Advanced C
9. Bit manipulation — an integer as bits in binary / hex, two's-complement signed mode, bitwise `& | ^ << >>`; click a bit to flip it
10. Backtracking — the N-Queens search: place one queen per column, backtracking on dead ends; counts backtracks
11. Structs & memory layout — field alignment and padding; reorder fields to see how `sizeof` changes

Plain HTML + canvas + KaTeX. Indigo accent. Zero build step.

Part of the *-lab series: [discrete-math-lab](https://github.com/andreaisabelmontana/discrete-math-lab) · [algos-lab](https://github.com/andreaisabelmontana/algos-lab) · [programming-principles-lab](https://github.com/andreaisabelmontana/programming-principles-lab)
