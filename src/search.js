// Search algorithms (demo 6) over a sorted ascending array.
// Each returns { index, probes } where index is the position of target or -1 if
// absent, and probes is the ordered list of indices examined. The probe list is
// what the canvas lights up step by step.

// Linear scan from the left. Because the array is sorted, the scan can stop
// early as soon as it passes a value greater than the target.
export function linearSearch(arr, target) {
  const probes = [];
  for (let i = 0; i < arr.length; i++) {
    probes.push(i);
    if (arr[i] === target) return { index: i, probes };
    if (arr[i] > target) break;
  }
  return { index: -1, probes };
}

// Binary search: halve the live range each step. Requires sorted input.
export function binarySearch(arr, target) {
  const probes = [];
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    probes.push(mid);
    if (arr[mid] === target) return { index: mid, probes };
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return { index: -1, probes };
}
