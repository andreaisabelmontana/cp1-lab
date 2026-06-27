// Bit manipulation (demo 9).
// Fixed-width binary encoding with optional two's-complement signed mode, plus
// the bitwise operations the page applies against a mask. Values are kept inside
// the width by modular wraparound, matching fixed-width C integer behaviour.

// Encode a value as an array of `width` bits, index 0 = most significant.
// In signed (two's complement) mode a negative value wraps to 2^width + value.
export function encode(val, width, signed) {
  const mod = 2 ** width;
  let u = val;
  if (signed && val < 0) u = mod + val;
  u = ((u % mod) + mod) % mod;
  const b = [];
  for (let i = width - 1; i >= 0; i--) b.push(Math.floor(u / (2 ** i)) % 2);
  return b;
}

// Interpret a big-endian bit array as an unsigned integer.
export function bitsToUnsigned(b) {
  return b.reduce((acc, bit) => acc * 2 + bit, 0);
}

// Interpret a big-endian bit array as a two's-complement signed integer.
export function bitsToSigned(b) {
  const u = bitsToUnsigned(b);
  return b[0] === 1 ? u - 2 ** b.length : u;
}

// Inclusive value range representable in `width` bits, signed or unsigned.
export function range(width, signed) {
  return signed
    ? { lo: -(2 ** (width - 1)), hi: 2 ** (width - 1) - 1 }
    : { lo: 0, hi: 2 ** width - 1 };
}

// Apply a bitwise operation, wrapping the result into `width` bits.
//   and/or/xor combine value with mask; shl/shr shift value by one.
export function bitOp(op, value, mask, width) {
  const mod = 2 ** width;
  switch (op) {
    case 'and': return (value & mask) % mod;
    case 'or':  return (value | mask) % mod;
    case 'xor': return (value ^ mask) % mod;
    case 'shl': return (value << 1) % mod;
    case 'shr': return value >> 1;
    default: throw new Error(`unknown op ${op}`);
  }
}
