// Struct memory layout (demo 11).
// Models how a C compiler lays out struct fields: every field is aligned to its
// own size, padding bytes are inserted before a field when needed, and the whole
// struct is padded up to a multiple of its largest member's alignment.

export const TYPE_SIZE = { char: 1, short: 2, int: 4, double: 8 };

// fields: array of [name, type]. Returns the byte layout, total sizeof, the
// number of real data bytes and the number of padding bytes inserted.
export function layout(fields) {
  let offset = 0, maxAlign = 1;
  const cells = [];
  for (const [name, type] of fields) {
    const sz = TYPE_SIZE[type];
    if (sz === undefined) throw new Error(`unknown type ${type}`);
    const align = sz;
    maxAlign = Math.max(maxAlign, align);
    const pad = (align - (offset % align)) % align;
    for (let p = 0; p < pad; p++) cells.push({ pad: true });
    offset += pad;
    for (let b = 0; b < sz; b++) cells.push({ name, type, first: b === 0, size: sz });
    offset += sz;
  }
  const tailPad = (maxAlign - (offset % maxAlign)) % maxAlign;
  for (let p = 0; p < tailPad; p++) cells.push({ pad: true });
  offset += tailPad;

  const dataBytes = fields.reduce((s, [, t]) => s + TYPE_SIZE[t], 0);
  return { cells, size: offset, dataBytes, padding: offset - dataBytes };
}
