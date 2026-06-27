// Quadratic sorting algorithms (demo 7): bubble, selection, insertion.
// Each sorts a copy of the input ascending and reports the comparison and swap
// counts that the animation tracks. The input array is never mutated.

export function bubbleSort(input) {
  const a = input.slice();
  let cmp = 0, swp = 0;
  for (let p = 0; p < a.length - 1; p++) {
    for (let q = 0; q < a.length - 1 - p; q++) {
      cmp++;
      if (a[q] > a[q + 1]) { [a[q], a[q + 1]] = [a[q + 1], a[q]]; swp++; }
    }
  }
  return { sorted: a, cmp, swp };
}

export function selectionSort(input) {
  const a = input.slice();
  let cmp = 0, swp = 0;
  for (let p = 0; p < a.length - 1; p++) {
    let m = p;
    for (let q = p + 1; q < a.length; q++) { cmp++; if (a[q] < a[m]) m = q; }
    if (m !== p) { [a[p], a[m]] = [a[m], a[p]]; swp++; }
  }
  return { sorted: a, cmp, swp };
}

export function insertionSort(input) {
  const a = input.slice();
  let cmp = 0, swp = 0;
  for (let p = 1; p < a.length; p++) {
    let q = p;
    while (q > 0) {
      cmp++;
      if (a[q - 1] > a[q]) { [a[q - 1], a[q]] = [a[q], a[q - 1]]; swp++; q--; }
      else break;
    }
  }
  return { sorted: a, cmp, swp };
}

export const SORTS = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
};
