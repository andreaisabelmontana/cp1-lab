// ============================================================
// cp1-lab — 11 visual demos for Computer Programming I (C language):
//   variables · expressions · control flow · recursion · pointers ·
//   search · sorting · linked lists · bit manipulation · backtracking · structs.
//
// Every demo follows the same pattern as the rest of the *-lab series:
//   1. read control state through helpers that always return finite values
//   2. compute into a local buffer
//   3. render in a single idempotent `draw()` that resets the transform
//      and clears the canvas, so resizes / rapid input never compound state.
// Animated demos use requestAnimationFrame with explicit cancellation.
// ============================================================

// ---------- helpers ------------------------------------------------------
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function n(id, fallback) {
  const el = document.getElementById(id);
  const v = el ? +el.value : NaN;
  return Number.isFinite(v) ? v : fallback;
}
const $ = id => document.getElementById(id);
const setText = (id, t) => { const el = $(id); if (el) el.textContent = t; };

// ---------- palette ------------------------------------------------------
const ACCENT = '#4338CA';
const ACCENT_S = 'rgba(67,56,202,0.16)';
const RULE  = '#E5E5EA';
const RULE_H = '#CDCDD4';
const INK   = '#15151A';
const INK_S = '#4B4B55';
const MUTED = '#8A8A92';
const GOOD  = '#16A34A';
const WARN  = '#F59E0B';
const BAD   = '#DC2626';

function fitCanvas(cv) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = cv.getBoundingClientRect();
  const cssW = Math.max(80, rect.width);
  const cssH = Math.max(80, parseInt(cv.getAttribute('height'), 10) || 280);
  cv.width  = Math.floor(cssW * dpr);
  cv.height = Math.floor(cssH * dpr);
  cv.style.height = cssH + 'px';
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.font = '12px Inter, sans-serif';
  ctx.textBaseline = 'alphabetic';
  return { ctx, w: cssW, h: cssH };
}
// pointer position in CSS pixels relative to canvas
function ptr(cv, ev) {
  const r = cv.getBoundingClientRect();
  return { x: ev.clientX - r.left, y: ev.clientY - r.top };
}

// ============================================================
// 1. VARIABLE TRACING — step a small C program, watch the vars
// ============================================================
(function tracing() {
  const cv = $('cv-trace'); if (!cv) return;

  // Each program: source lines + a step function producing snapshots.
  // A snapshot = { line: <line index about to / just run>, vars: {...}, done }.
  const PROGRAMS = {
    swap: {
      src: ['int a = 3, b = 8;', 'int t = a;', 'a = b;', 'b = t;', '// a=8, b=3'],
      run() {
        const snaps = [];
        let a = 3, b = 8, t;
        snaps.push({ line: 0, vars: { a, b } });
        t = a;       snaps.push({ line: 1, vars: { a, b, t } });
        a = b;       snaps.push({ line: 2, vars: { a, b, t } });
        b = t;       snaps.push({ line: 3, vars: { a, b, t } });
        snaps.push({ line: 4, vars: { a, b, t }, done: true });
        return snaps;
      },
    },
    sumdig: {
      src: ['int x = 4093, s = 0;', 'while (x > 0) {', '  s += x % 10;', '  x /= 10;', '}', '// s = digit sum'],
      run() {
        const snaps = [];
        let x = 4093, s = 0;
        snaps.push({ line: 0, vars: { x, s } });
        while (x > 0) {
          snaps.push({ line: 1, vars: { x, s } });
          s += x % 10; snaps.push({ line: 2, vars: { x, s } });
          x = Math.floor(x / 10); snaps.push({ line: 3, vars: { x, s } });
        }
        snaps.push({ line: 1, vars: { x, s } });
        snaps.push({ line: 5, vars: { x, s }, done: true });
        return snaps;
      },
    },
    pow: {
      src: ['int b = 2, e = 5;', 'int r = 1;', 'for (int i = 0; i < e; i++)', '  r *= b;', '// r = b^e'],
      run() {
        const snaps = [];
        let b = 2, e = 5, r = 1;
        snaps.push({ line: 0, vars: { b, e } });
        snaps.push({ line: 1, vars: { b, e, r } });
        for (let i = 0; i < e; i++) {
          snaps.push({ line: 2, vars: { b, e, r, i } });
          r *= b; snaps.push({ line: 3, vars: { b, e, r, i } });
        }
        snaps.push({ line: 2, vars: { b, e, r, i: e } });
        snaps.push({ line: 4, vars: { b, e, r }, done: true });
        return snaps;
      },
    },
  };

  let snaps = [], idx = 0, timer = null;
  function rebuild() {
    snaps = PROGRAMS[$('tr-prog').value].run();
    idx = 0; stop();
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }

  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const prog = PROGRAMS[$('tr-prog').value];
    const snap = snaps[idx] || { line: 0, vars: {} };

    // left: source code
    const lx = 16, ly = 28, lh = 22;
    ctx.font = '13px JetBrains Mono, monospace'; ctx.textAlign = 'left';
    prog.src.forEach((ln, i) => {
      const y = ly + i * lh;
      if (i === snap.line && !snap.done) {
        ctx.fillStyle = ACCENT_S; ctx.fillRect(lx - 6, y - 14, w * 0.56, lh - 2);
      }
      ctx.fillStyle = ln.trim().startsWith('//') ? MUTED : (i === snap.line && !snap.done ? ACCENT : INK_S);
      ctx.fillText(ln, lx, y);
    });

    // right: variable table
    const tx = w * 0.62, ty = 40;
    ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif';
    ctx.fillText('variables', tx, ty - 18);
    const entries = Object.entries(snap.vars);
    ctx.font = '13px JetBrains Mono, monospace';
    entries.forEach(([k, v], i) => {
      const y = ty + i * 26;
      ctx.fillStyle = '#FBFBFD'; ctx.fillRect(tx, y - 14, w - tx - 14, 22);
      ctx.strokeStyle = RULE; ctx.lineWidth = 1; ctx.strokeRect(tx, y - 14, w - tx - 14, 22);
      ctx.fillStyle = ACCENT; ctx.fillText(k, tx + 8, y + 1);
      ctx.fillStyle = INK; ctx.textAlign = 'right';
      ctx.fillText(String(v), w - 22, y + 1);
      ctx.textAlign = 'left';
    });
    if (entries.length === 0) { ctx.fillStyle = MUTED; ctx.fillText('—', tx + 8, ty + 8); }

    setText('tr-line', snap.done ? '✓' : snap.line + 1);
    setText('tr-status', snap.done ? 'done' : idx === 0 ? 'ready' : 'running');
    $('tr-status').style.color = snap.done ? GOOD : idx === 0 ? INK_S : ACCENT;
  }
  function step() { if (idx < snaps.length - 1) idx++; else stop(); draw(); }

  $('tr-step').addEventListener('click', () => { stop(); step(); });
  $('tr-reset').addEventListener('click', () => { idx = 0; stop(); draw(); });
  $('tr-run').addEventListener('click', () => {
    stop();
    timer = setInterval(() => { if (idx < snaps.length - 1) step(); else stop(); }, 520);
  });
  $('tr-prog').addEventListener('change', () => { rebuild(); draw(); });
  window.addEventListener('resize', draw);
  rebuild(); draw();
})();

// ============================================================
// 2. EXPRESSIONS — recursive-descent parser, int vs double
// ============================================================
(function expressions() {
  const cv = $('cv-expr'); if (!cv) return;

  function tokenize(src) {
    const toks = [];
    for (let i = 0; i < src.length; i++) {
      const c = src[i];
      if (c === ' ' || c === '\t') continue;
      if (/[0-9.]/.test(c)) {
        let num = c; while (i + 1 < src.length && /[0-9.]/.test(src[i + 1])) num += src[++i];
        toks.push({ t: 'num', v: parseFloat(num) });
      } else if ('+-*/%()'.includes(c)) toks.push({ t: c });
      else throw new Error(`unexpected "${c}"`);
    }
    return toks;
  }
  function parse(toks) {
    let i = 0;
    const peek = () => toks[i];
    function atom() {
      const tk = peek();
      if (!tk) throw new Error('unexpected end');
      if (tk.t === 'num') { i++; return { op: 'num', v: tk.v }; }
      if (tk.t === '(') { i++; const e = expr(); if (!toks[i] || toks[i].t !== ')') throw new Error('missing )'); i++; return e; }
      if (tk.t === '-') { i++; return { op: 'neg', a: atom() }; }
      throw new Error('expected number');
    }
    function term() {
      let l = atom();
      while (peek() && '*/%'.includes(peek().t)) { const op = peek().t; i++; l = { op, a: l, b: atom() }; }
      return l;
    }
    function expr() {
      let l = term();
      while (peek() && '+-'.includes(peek().t)) { const op = peek().t; i++; l = { op, a: l, b: term() }; }
      return l;
    }
    const tree = expr();
    if (i !== toks.length) throw new Error('trailing tokens');
    return tree;
  }
  function evalNode(node, asInt) {
    const t = a => asInt ? Math.trunc(a) : a;
    switch (node.op) {
      case 'num': return asInt ? Math.trunc(node.v) : node.v;
      case 'neg': return -evalNode(node.a, asInt);
      case '+': return evalNode(node.a, asInt) + evalNode(node.b, asInt);
      case '-': return evalNode(node.a, asInt) - evalNode(node.b, asInt);
      case '*': return evalNode(node.a, asInt) * evalNode(node.b, asInt);
      case '/': { const a = evalNode(node.a, asInt), b = evalNode(node.b, asInt); return asInt ? Math.trunc(a / b) : a / b; }
      case '%': { const a = evalNode(node.a, asInt), b = evalNode(node.b, asInt); return asInt ? (a % b) : (a % b); }
    }
    return t(0);
  }
  // tree layout: assign x by in-order, depth by recursion
  function layout(node, depth, box) {
    const sym = { num: null, neg: '-', '+': '+', '-': '-', '*': '*', '/': '/', '%': '%' }[node.op];
    if (node.op === 'num') {
      const x = box.x; box.x += 1;
      return { x, depth, label: String(node.v), children: [] };
    }
    const kids = [];
    if (node.a) kids.push(layout(node.a, depth + 1, box));
    const myX = box.x; box.x += 1;
    if (node.b) kids.push(layout(node.b, depth + 1, box));
    const cx = kids.length ? kids.reduce((s, k) => s + k.x, 0) / kids.length : myX;
    return { x: cx, depth, label: sym, children: kids };
  }
  function collect(node, arr) { arr.push(node); node.children.forEach(c => collect(c, arr)); }

  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    setText('ex-err', ''); $('ex-err').classList.remove('err');
    let tree;
    try {
      const toks = tokenize($('ex-f').value);
      if (toks.length === 0) throw new Error('empty');
      tree = parse(toks);
    } catch (e) {
      setText('ex-err', e.message); $('ex-err').classList.add('err');
      setText('ex-int', 'err'); setText('ex-dbl', 'err');
      $('ex-int').style.color = BAD;
      return;
    }
    let iv, dv;
    try { iv = evalNode(tree, true); dv = evalNode(tree, false); }
    catch (e) { setText('ex-err', e.message); $('ex-err').classList.add('err'); return; }
    setText('ex-int', Number.isFinite(iv) ? String(iv) : 'NaN');
    setText('ex-dbl', Number.isFinite(dv) ? (Number.isInteger(dv) ? dv.toFixed(1) : dv.toFixed(4).replace(/0+$/, '').replace(/\.$/, '.0')) : 'NaN');
    $('ex-int').style.color = ACCENT;

    // render tree
    const box = { x: 0 };
    layout(tree, 0, box);
    const nodes = []; { const b = { x: 0 }; const root = layout(tree, 0, b); collect(root, nodes); }
    const maxX = Math.max(1, ...nodes.map(d => d.x));
    const maxD = Math.max(1, ...nodes.map(d => d.depth));
    const px = x => 40 + (w - 80) * (maxX === 0 ? 0.5 : x / maxX);
    const py = d => 40 + (h - 70) * (maxD === 0 ? 0 : d / maxD);
    // edges
    ctx.strokeStyle = RULE_H; ctx.lineWidth = 1.4;
    nodes.forEach(nd => nd.children.forEach(c => {
      ctx.beginPath(); ctx.moveTo(px(nd.x), py(nd.depth)); ctx.lineTo(px(c.x), py(c.depth)); ctx.stroke();
    }));
    // nodes
    ctx.textAlign = 'center';
    nodes.forEach(nd => {
      const x = px(nd.x), y = py(nd.depth);
      const leaf = nd.children.length === 0;
      ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fillStyle = leaf ? '#fff' : ACCENT; ctx.fill();
      ctx.lineWidth = 1.6; ctx.strokeStyle = leaf ? RULE_H : ACCENT; ctx.stroke();
      ctx.fillStyle = leaf ? INK : '#fff';
      ctx.font = '600 12px JetBrains Mono, monospace';
      ctx.fillText(nd.label, x, y + 4);
    });
    ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif';
    ctx.fillText('evaluation tree — leaves are operands, evaluated bottom-up', w / 2, h - 10);
    ctx.textAlign = 'left';
  }
  $('ex-f').addEventListener('input', draw);
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 3. LOOPS — counted-loop iteration table + accumulator bars
// ============================================================
(function loops() {
  const cv = $('cv-loop'); if (!cv) return;
  function compute() {
    const a = n('lp-a', 1), lim = n('lp-n', 6), step = n('lp-s', 1);
    const kind = $('lp-kind').value;
    const rows = [];
    let acc = kind === 'fact' ? 1 : 0;
    for (let i = a; i < lim; i += step) {
      if (kind === 'sum') acc += i;
      else if (kind === 'fact') acc *= (i === 0 ? 1 : i);
      else acc += i * i;
      rows.push({ i, acc });
      if (rows.length > 40) break;
    }
    return { rows, acc, a, lim, step, kind };
  }
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    setText('lp-av', n('lp-a', 1)); setText('lp-nv', n('lp-n', 6)); setText('lp-sv', n('lp-s', 1));
    const { rows, acc } = compute();
    setText('lp-iters', rows.length);
    setText('lp-final', acc);

    // header / table on left
    ctx.textAlign = 'left'; ctx.font = '12px JetBrains Mono, monospace';
    const tx = 16, ty = 26, rh = Math.min(24, (h - 36) / (rows.length + 1));
    ctx.fillStyle = MUTED; ctx.fillText('i', tx, ty); ctx.fillText('acc', tx + 70, ty);
    ctx.strokeStyle = RULE_H; ctx.beginPath(); ctx.moveTo(tx, ty + 6); ctx.lineTo(tx + 130, ty + 6); ctx.stroke();
    const maxAcc = Math.max(1, ...rows.map(r => Math.abs(r.acc)));
    rows.forEach((r, k) => {
      const y = ty + rh * (k + 1) + 2;
      ctx.fillStyle = INK_S; ctx.fillText(String(r.i), tx, y);
      ctx.fillStyle = ACCENT; ctx.fillText(String(r.acc), tx + 70, y);
      // bar to the right
      const bx = 200, bw = (w - 220) * (Math.abs(r.acc) / maxAcc);
      ctx.fillStyle = ACCENT_S; ctx.fillRect(bx, y - rh + 6, bw, rh - 4);
    });
    if (rows.length === 0) { ctx.fillStyle = MUTED; ctx.fillText('loop body never runs (condition false at start)', tx, ty + 30); }
  }
  ['lp-a', 'lp-n', 'lp-s'].forEach(id => $(id).addEventListener('input', draw));
  $('lp-kind').addEventListener('change', draw);
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 4. RECURSION — call tree + stack depth
// ============================================================
(function recursion() {
  const cv = $('cv-recur'); if (!cv) return;
  let calls, depth;
  // build a call tree with {label, value, children}
  function buildFact(k) { calls++; const node = { label: `f(${k})`, children: [] }; if (k <= 1) { node.value = 1; return node; } const c = buildFact(k - 1); node.children.push(c); node.value = k * c.value; return node; }
  function buildFib(k) { calls++; const node = { label: `f(${k})`, children: [] }; if (k < 2) { node.value = k; return node; } const a = buildFib(k - 1), b = buildFib(k - 2); node.children.push(a, b); node.value = a.value + b.value; return node; }
  function buildGcd(a, b) { calls++; const node = { label: `g(${a},${b})`, children: [] }; if (b === 0) { node.value = a; return node; } const c = buildGcd(b, a % b); node.children.push(c); node.value = c.value; return node; }

  // assign x positions by leaf order, depth by level; track max depth
  function place(node, d, box) {
    depth = Math.max(depth, d);
    if (node.children.length === 0) { node.x = box.x++; node.depth = d; return; }
    node.children.forEach(c => place(c, d + 1, box));
    node.x = node.children.reduce((s, c) => s + c.x, 0) / node.children.length;
    node.depth = d;
  }
  function flat(node, arr) { arr.push(node); node.children.forEach(c => flat(c, arr)); }

  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const fn = $('rc-fn').value, N = n('rc-n', 4);
    setText('rc-nv', N);
    calls = 0; depth = 0;
    let root;
    if (fn === 'fact') root = buildFact(N);
    else if (fn === 'fib') root = buildFib(N);
    else root = buildGcd(48, ([0, 1, 2, 3, 5, 8, 13, 21][N] || N)); // varied second arg
    const box = { x: 0 };
    place(root, 0, box);
    const nodes = []; flat(root, nodes);
    const maxX = Math.max(1, ...nodes.map(d => d.x));
    const maxD = Math.max(1, depth);
    const px = x => 30 + (w - 60) * (maxX === 0 ? 0.5 : x / maxX);
    const py = d => 34 + (h - 70) * (maxD === 0 ? 0 : d / maxD);

    ctx.strokeStyle = RULE_H; ctx.lineWidth = 1.3;
    nodes.forEach(nd => nd.children.forEach(c => {
      ctx.beginPath(); ctx.moveTo(px(nd.x), py(nd.depth)); ctx.lineTo(px(c.x), py(c.depth)); ctx.stroke();
    }));
    ctx.textAlign = 'center';
    nodes.forEach(nd => {
      const x = px(nd.x), y = py(nd.depth);
      const base = nd.children.length === 0;
      ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fillStyle = base ? GOOD : '#fff'; ctx.fill();
      ctx.lineWidth = 1.6; ctx.strokeStyle = base ? GOOD : ACCENT; ctx.stroke();
      ctx.fillStyle = base ? '#fff' : ACCENT; ctx.font = '600 10px JetBrains Mono, monospace';
      ctx.fillText(nd.label, x, y - 1);
      ctx.fillStyle = base ? '#fff' : INK_S; ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText('=' + nd.value, x, y + 9);
    });
    ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif';
    ctx.fillText('green = base case', w / 2, h - 8);
    ctx.textAlign = 'left';

    setText('rc-res', root.value);
    setText('rc-calls', calls);
    setText('rc-depth', depth + 1);
  }
  $('rc-fn').addEventListener('change', draw);
  $('rc-n').addEventListener('input', draw);
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 5. POINTERS — memory cells, address, deref, arithmetic
// ============================================================
(function pointers() {
  const cv = $('cv-ptr'); if (!cv) return;
  const BASE = 0x1000, ISIZE = 4;
  let arr = [];
  function ensure() {
    const len = n('pt-n', 6);
    if (arr.length !== len) { arr = []; for (let i = 0; i < len; i++) arr.push((i * 7 + 3) % 100); }
    $('pt-i').max = String(len - 1);
  }
  function hex(a) { return '0x' + a.toString(16).toUpperCase(); }
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    ensure();
    const len = arr.length;
    let idx = clamp(n('pt-i', 2), 0, len - 1);
    setText('pt-nv', len); setText('pt-iv', idx);

    const cw = Math.min(70, (w - 40) / len), x0 = (w - cw * len) / 2, y0 = 90, ch = 46;
    ctx.textAlign = 'center';
    for (let i = 0; i < len; i++) {
      const x = x0 + cw * i;
      const here = i === idx;
      ctx.fillStyle = here ? ACCENT : '#fff';
      ctx.fillRect(x, y0, cw - 3, ch);
      ctx.strokeStyle = here ? ACCENT : RULE_H; ctx.lineWidth = here ? 2 : 1; ctx.strokeRect(x, y0, cw - 3, ch);
      ctx.fillStyle = here ? '#fff' : INK; ctx.font = '600 15px JetBrains Mono, monospace';
      ctx.fillText(arr[i], x + (cw - 3) / 2, y0 + ch / 2 + 5);
      // index above
      ctx.fillStyle = MUTED; ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText('[' + i + ']', x + (cw - 3) / 2, y0 - 22);
      // address below
      ctx.fillStyle = here ? ACCENT : MUTED; ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText(hex(BASE + i * ISIZE), x + (cw - 3) / 2, y0 + ch + 14);
    }
    // pointer arrow
    const px = x0 + cw * idx + (cw - 3) / 2;
    ctx.strokeStyle = ACCENT; ctx.fillStyle = ACCENT; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px, y0 - 40); ctx.lineTo(px, y0 - 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px - 5, y0 - 12); ctx.lineTo(px, y0 - 4); ctx.lineTo(px + 5, y0 - 12); ctx.closePath(); ctx.fill();
    ctx.font = '600 12px JetBrains Mono, monospace'; ctx.fillText('p', px, y0 - 44);
    ctx.fillStyle = INK_S; ctx.font = '12px Inter, sans-serif';
    ctx.fillText('int a[' + len + '];  int *p = &a[' + idx + '];', w / 2, 30);
    ctx.textAlign = 'left';

    setText('pt-addr', hex(BASE + idx * ISIZE));
    setText('pt-deref', arr[idx]);
    setText('pt-next', idx + 1 < len ? arr[idx + 1] : 'out of bounds');
    $('pt-next').style.color = idx + 1 < len ? ACCENT : BAD;
  }
  $('pt-n').addEventListener('input', () => { ensure(); draw(); });
  $('pt-i').addEventListener('input', draw);
  $('pt-inc').addEventListener('click', () => { $('pt-i').value = clamp(n('pt-i', 0) + 1, 0, arr.length - 1); draw(); });
  $('pt-dec').addEventListener('click', () => { $('pt-i').value = clamp(n('pt-i', 0) - 1, 0, arr.length - 1); draw(); });
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 6. SEARCH — linear vs binary, step-through probes
// ============================================================
(function search() {
  const cv = $('cv-search'); if (!cv) return;
  let arr = [], target = 20, alg = 'bin';
  let state = null; // {probes:[], lo, hi, mid, idx, found, done}
  function rebuild() {
    const len = n('se-n', 15);
    arr = [];
    let v = Math.floor(Math.random() * 4);
    for (let i = 0; i < len; i++) { arr.push(v); v += 1 + Math.floor(Math.random() * 4); }
    $('se-t').max = String(arr[arr.length - 1] + 3);
    reset();
  }
  function reset() {
    target = clamp(n('se-t', 20), 0, +$('se-t').max);
    alg = $('se-alg').value;
    state = { probes: [], lo: 0, hi: arr.length - 1, mid: -1, idx: -1, found: -1, done: false };
  }
  function step() {
    if (!state || state.done) return;
    if (alg === 'lin') {
      const i = state.idx + 1;
      if (i >= arr.length) { state.done = true; return; }
      state.idx = i; state.probes.push(i);
      if (arr[i] === target) { state.found = i; state.done = true; }
      else if (arr[i] > target) { state.done = true; } // sorted, can stop
    } else {
      if (state.lo > state.hi) { state.done = true; return; }
      const m = Math.floor((state.lo + state.hi) / 2);
      state.mid = m; state.probes.push(m);
      if (arr[m] === target) { state.found = m; state.done = true; }
      else if (arr[m] < target) state.lo = m + 1;
      else state.hi = m - 1;
    }
  }
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    setText('se-nv', arr.length); setText('se-tv', target);
    const len = arr.length;
    const cw = Math.min(54, (w - 30) / len), x0 = (w - cw * len) / 2, y0 = h * 0.42, ch = 44;
    ctx.textAlign = 'center'; ctx.font = '600 13px JetBrains Mono, monospace';
    const last = state.probes[state.probes.length - 1];
    for (let i = 0; i < len; i++) {
      const x = x0 + cw * i;
      const inRange = alg === 'bin' && !state.done ? (i >= state.lo && i <= state.hi) : true;
      let fill = '#fff', stroke = RULE_H;
      if (alg === 'bin' && inRange && !state.done) fill = '#FBFBFD';
      if (state.probes.includes(i)) { fill = ACCENT_S; stroke = ACCENT; }
      if (i === last) { stroke = ACCENT; }
      if (i === state.found) { fill = GOOD; stroke = GOOD; }
      ctx.fillStyle = fill; ctx.fillRect(x, y0, cw - 3, ch);
      ctx.strokeStyle = stroke; ctx.lineWidth = (i === last || i === state.found) ? 2 : 1; ctx.strokeRect(x, y0, cw - 3, ch);
      ctx.fillStyle = i === state.found ? '#fff' : (state.probes.includes(i) ? ACCENT : INK_S);
      ctx.fillText(arr[i], x + (cw - 3) / 2, y0 + ch / 2 + 5);
      ctx.fillStyle = MUTED; ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText(i, x + (cw - 3) / 2, y0 - 8);
      ctx.font = '600 13px JetBrains Mono, monospace';
    }
    ctx.fillStyle = INK_S; ctx.font = '12px Inter, sans-serif';
    const msg = state.done
      ? (state.found >= 0 ? `found ${target} at index ${state.found}` : `${target} not in array`)
      : alg === 'bin' ? `searching range [${state.lo}, ${state.hi}]` : `scanning left to right`;
    ctx.fillText(msg, w / 2, h - 14);
    ctx.textAlign = 'left';

    setText('se-probes', state.probes.length);
    setText('se-found', state.done ? (state.found >= 0 ? state.found : 'absent') : '…');
    $('se-found').style.color = state.done ? (state.found >= 0 ? GOOD : BAD) : MUTED;
  }
  $('se-n').addEventListener('input', () => { rebuild(); draw(); });
  $('se-t').addEventListener('input', () => { reset(); draw(); });
  $('se-alg').addEventListener('change', () => { reset(); draw(); });
  $('se-step').addEventListener('click', () => { step(); draw(); });
  $('se-reset').addEventListener('click', () => { reset(); draw(); });
  window.addEventListener('resize', draw);
  rebuild(); draw();
})();

// ============================================================
// 7. SORTING — animated bubble / selection / insertion
// ============================================================
(function sorting() {
  const cv = $('cv-sort'); if (!cv) return;
  let arr = [], steps = [], si = 0, raf = null, playing = false;
  let cmp = 0, swp = 0, hi = [-1, -1], sorted = new Set();

  function shuffle() {
    const len = n('so-n', 14);
    arr = [];
    for (let i = 0; i < len; i++) arr.push(1 + Math.floor(Math.random() * 99));
    buildSteps(); stop();
  }
  // record a step list of {a:[...], i, j, sortedUpTo} for replay
  function buildSteps() {
    const a = arr.slice(); steps = []; si = 0;
    const alg = $('so-alg').value;
    let c = 0, s = 0;
    const snap = (i, j, doneFrom) => steps.push({ a: a.slice(), i, j, cmp: c, swp: s, doneFrom });
    snap(-1, -1, a.length);
    if (alg === 'bubble') {
      for (let p = 0; p < a.length - 1; p++) {
        for (let q = 0; q < a.length - 1 - p; q++) {
          c++; snap(q, q + 1, a.length - p);
          if (a[q] > a[q + 1]) { [a[q], a[q + 1]] = [a[q + 1], a[q]]; s++; snap(q, q + 1, a.length - p); }
        }
      }
    } else if (alg === 'selection') {
      for (let p = 0; p < a.length - 1; p++) {
        let m = p;
        for (let q = p + 1; q < a.length; q++) { c++; snap(m, q, p); if (a[q] < a[m]) m = q; }
        if (m !== p) { [a[p], a[m]] = [a[m], a[p]]; s++; }
        snap(p, m, p + 1);
      }
    } else { // insertion
      for (let p = 1; p < a.length; p++) {
        let q = p;
        while (q > 0) { c++; snap(q - 1, q, p + 1); if (a[q - 1] > a[q]) { [a[q - 1], a[q]] = [a[q], a[q - 1]]; s++; snap(q - 1, q, p + 1); q--; } else break; }
      }
    }
    snap(-1, -1, a.length);
  }
  function stop() { playing = false; if (raf) { cancelAnimationFrame(raf); raf = null; } setText('so-play', 'play'); render(); }
  function render() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const st = steps[si] || { a: arr, i: -1, j: -1, cmp: 0, swp: 0, doneFrom: arr.length };
    const a = st.a, len = a.length;
    const bw = (w - 20) / len, maxV = Math.max(1, ...a);
    for (let k = 0; k < len; k++) {
      const x = 10 + bw * k, bh = (h - 40) * (a[k] / maxV), y = h - 24 - bh;
      const isHi = k === st.i || k === st.j;
      const done = k >= st.doneFrom;
      ctx.fillStyle = isHi ? ACCENT : done ? GOOD : '#C9C6EB';
      ctx.fillRect(x, y, bw - 2, bh);
    }
    setText('so-cmp', st.cmp); setText('so-swp', st.swp);
  }
  function tick() {
    if (!playing) return;
    const speed = n('so-sp', 6);
    si = Math.min(steps.length - 1, si + Math.max(1, Math.round(speed / 3)));
    render();
    if (si >= steps.length - 1) { stop(); return; }
    raf = requestAnimationFrame(tick);
  }
  $('so-play').addEventListener('click', () => {
    if (playing) { stop(); return; }
    if (si >= steps.length - 1) si = 0;
    playing = true; setText('so-play', 'pause'); raf = requestAnimationFrame(tick);
  });
  $('so-shuffle').addEventListener('click', () => { shuffle(); render(); });
  $('so-n').addEventListener('input', () => { setText('so-nv', n('so-n', 14)); shuffle(); render(); });
  $('so-sp').addEventListener('input', () => setText('so-spv', n('so-sp', 6)));
  $('so-alg').addEventListener('change', () => { buildSteps(); stop(); });
  window.addEventListener('resize', render);
  setText('so-nv', n('so-n', 14)); setText('so-spv', n('so-sp', 6));
  shuffle(); render();
})();

// ============================================================
// 8. LINKED LIST — singly linked, insert / delete, pointers
// ============================================================
(function linkedList() {
  const cv = $('cv-list'); if (!cv) return;
  let list = [];
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    setText('ll-vv', n('ll-v', 7));
    setText('ll-len', list.length);
    const cy = h * 0.5, nodeW = 64, gap = 34, total = list.length * nodeW + (list.length) * gap + 60;
    let x = 16;
    const scale = total > w ? (w - 20) / total : 1;
    ctx.save();
    if (scale < 1) ctx.scale(scale, 1);

    // head label
    ctx.textAlign = 'left'; ctx.fillStyle = ACCENT; ctx.font = '600 12px JetBrains Mono, monospace';
    ctx.fillText('head', x, cy - 34);
    ctx.textAlign = 'center';
    list.forEach((v, i) => {
      const nx = x;
      // node: data box + next box
      ctx.fillStyle = '#fff'; ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.6;
      ctx.fillRect(nx, cy - 18, nodeW * 0.6, 36); ctx.strokeRect(nx, cy - 18, nodeW * 0.6, 36);
      ctx.fillRect(nx + nodeW * 0.6, cy - 18, nodeW * 0.4, 36); ctx.strokeRect(nx + nodeW * 0.6, cy - 18, nodeW * 0.4, 36);
      ctx.fillStyle = INK; ctx.font = '600 14px JetBrains Mono, monospace';
      ctx.fillText(v, nx + nodeW * 0.3, cy + 5);
      // next pointer dot
      ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.arc(nx + nodeW * 0.8, cy, 3, 0, Math.PI * 2); ctx.fill();
      // arrow to next
      const ax = nx + nodeW, ay = cy;
      const tx = nx + nodeW + gap;
      ctx.strokeStyle = INK_S; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(tx, ay); ctx.stroke();
      ctx.fillStyle = INK_S; ctx.beginPath(); ctx.moveTo(tx, ay); ctx.lineTo(tx - 6, ay - 4); ctx.lineTo(tx - 6, ay + 4); ctx.closePath(); ctx.fill();
      x += nodeW + gap;
    });
    // NULL terminator
    ctx.fillStyle = MUTED; ctx.font = '600 12px JetBrains Mono, monospace';
    ctx.fillText('NULL', x + 16, cy + 4);
    ctx.restore();
    if (list.length === 0) { ctx.textAlign = 'center'; ctx.fillStyle = MUTED; ctx.font = '12px Inter'; ctx.fillText('empty list — insert a node', w / 2, cy); }
    ctx.textAlign = 'left';
  }
  $('ll-head').addEventListener('click', () => { if (list.length < 12) list.unshift(n('ll-v', 7)); draw(); });
  $('ll-tail').addEventListener('click', () => { if (list.length < 12) list.push(n('ll-v', 7)); draw(); });
  $('ll-del').addEventListener('click', () => { const v = n('ll-v', 7); const i = list.indexOf(v); if (i >= 0) list.splice(i, 1); draw(); });
  $('ll-clear').addEventListener('click', () => { list = []; draw(); });
  $('ll-v').addEventListener('input', () => setText('ll-vv', n('ll-v', 7)));
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 9. BITS — binary / hex, two's complement, bitwise ops
// ============================================================
(function bits() {
  const cv = $('cv-bits'); if (!cv) return;
  let bits = []; // current value bits, index 0 = MSB
  function encode(val, width, signed) {
    let u = val;
    if (signed && val < 0) u = (2 ** width) + val;
    u = ((u % (2 ** width)) + (2 ** width)) % (2 ** width);
    const b = [];
    for (let i = width - 1; i >= 0; i--) b.push((Math.floor(u / (2 ** i))) % 2);
    return b;
  }
  function bitsToU(b) { return b.reduce((acc, bit) => acc * 2 + bit, 0); }
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const width = n('bt-w', 8), signed = $('bt-tc').checked;
    let val = Math.round(n('bt-v', 42));
    let lo, hi;
    if (signed) { lo = -(2 ** (width - 1)); hi = 2 ** (width - 1) - 1; } else { lo = 0; hi = 2 ** width - 1; }
    val = clamp(val, lo, hi);
    setText('bt-vv', val); setText('bt-wv', width); setText('bt-mv', n('bt-m', 15));

    if (bits.length !== width) bits = encode(val, width, signed);
    // keep bits in sync with slider value when value changed externally
    bits = encode(val, width, signed);

    const cw = Math.min(38, (w - 40) / width), x0 = (w - cw * width) / 2, y0 = 56, ch = 40;
    ctx.textAlign = 'center';
    bits.forEach((bit, k) => {
      const x = x0 + cw * k;
      ctx.fillStyle = bit ? ACCENT : '#fff';
      ctx.fillRect(x, y0, cw - 3, ch);
      ctx.strokeStyle = RULE_H; ctx.lineWidth = 1; ctx.strokeRect(x, y0, cw - 3, ch);
      ctx.fillStyle = bit ? '#fff' : MUTED; ctx.font = '600 15px JetBrains Mono, monospace';
      ctx.fillText(bit, x + (cw - 3) / 2, y0 + ch / 2 + 5);
      ctx.fillStyle = MUTED; ctx.font = '9px JetBrains Mono, monospace';
      const place = width - 1 - k;
      ctx.fillText((signed && place === width - 1) ? `-2^${place}` : `2^${place}`, x + (cw - 3) / 2, y0 + ch + 14);
    });
    ctx.fillStyle = INK_S; ctx.font = '12px Inter';
    ctx.fillText(`${signed ? 'signed' : 'unsigned'} ${width}-bit · range [${lo}, ${hi}] · click a bit to flip`, w / 2, 28);

    const u = bitsToU(bits);
    setText('bt-bin', bits.join(''));
    setText('bt-hex', '0x' + u.toString(16).toUpperCase().padStart(Math.ceil(width / 4), '0'));

    // operation result
    const op = $('bt-op').value, mask = clamp(n('bt-m', 15), 0, 2 ** width - 1);
    let res, label;
    const mod = 2 ** width;
    switch (op) {
      case 'and': res = (u & mask) % mod; label = `${u} & ${mask}`; break;
      case 'or':  res = (u | mask) % mod; label = `${u} | ${mask}`; break;
      case 'xor': res = (u ^ mask) % mod; label = `${u} ^ ${mask}`; break;
      case 'shl': res = (u << 1) % mod;   label = `${u} << 1`; break;
      case 'shr': res = u >> 1;           label = `${u} >> 1`; break;
      default: res = null;
    }
    if (res === null) { setText('bt-res', '—'); $('bt-res').style.color = INK_S; }
    else {
      const rb = encode(res, width, false).join('');
      setText('bt-res', `${rb} = ${res}`);
      $('bt-res').style.color = ACCENT;
      // draw mask + result rows
      ctx.font = '11px JetBrains Mono, monospace'; ctx.textAlign = 'left';
      if (op === 'and' || op === 'or' || op === 'xor') {
        ctx.fillStyle = MUTED; ctx.fillText('mask  ' + encode(mask, width, false).join(''), x0, y0 + ch + 38);
      }
      ctx.fillStyle = ACCENT; ctx.fillText(label + '  →  ' + rb, x0, y0 + ch + 54);
      ctx.textAlign = 'center';
    }
    ctx.textAlign = 'left';
  }
  cv.addEventListener('click', ev => {
    const { w } = fitCanvas(cv);
    const width = n('bt-w', 8), signed = $('bt-tc').checked;
    const cw = Math.min(38, (w - 40) / width), x0 = (w - cw * width) / 2, y0 = 56, ch = 40;
    const p = ptr(cv, ev);
    if (p.y < y0 || p.y > y0 + ch) return;
    const k = Math.floor((p.x - x0) / cw);
    if (k < 0 || k >= width) return;
    bits[k] ^= 1;
    // recompute value from bits and push back to slider (respecting sign)
    let u = bitsToU(bits);
    let val = u;
    if (signed && bits[0] === 1) val = u - 2 ** width;
    $('bt-v').value = String(clamp(val, -128, 255));
    draw();
  });
  ['bt-v', 'bt-w', 'bt-m'].forEach(id => $(id).addEventListener('input', () => { bits = []; draw(); }));
  $('bt-tc').addEventListener('change', () => { bits = []; draw(); });
  $('bt-op').addEventListener('change', draw);
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 10. BACKTRACKING — N-Queens, step-through solver
// ============================================================
(function queens() {
  const cv = $('cv-queens'); if (!cv) return;
  let N = 6, cols = [], col = 0, row = 0, backtracks = 0, done = false, solved = false, raf = null;

  function reset() {
    N = n('nq-n', 6); cols = []; col = 0; row = 0; backtracks = 0; done = false; solved = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
  }
  function safe(c, r) {
    for (let pc = 0; pc < c; pc++) {
      const pr = cols[pc];
      if (pr === r || Math.abs(pr - r) === Math.abs(pc - c)) return false;
    }
    return true;
  }
  // one incremental step of the column-by-column backtracking search
  function step() {
    if (done) return;
    if (col === N) { done = true; solved = true; return; }
    let r = row;
    while (r < N && !safe(col, r)) r++;
    if (r < N) { cols[col] = r; col++; row = 0; }
    else {
      // backtrack
      if (col === 0) { done = true; solved = false; return; }
      col--; backtracks++;
      row = cols[col] + 1;
      cols.length = col;
    }
  }
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    setText('nq-nv', N);
    const size = Math.min(w - 20, h - 20), bx = (w - size) / 2, by = (h - size) / 2, cell = size / N;
    for (let c = 0; c < N; c++) for (let r = 0; r < N; r++) {
      const x = bx + c * cell, y = by + r * cell;
      ctx.fillStyle = (c + r) % 2 === 0 ? '#fff' : '#F0EFFA';
      ctx.fillRect(x, y, cell, cell);
    }
    // current column highlight
    if (!done && col < N) { ctx.fillStyle = ACCENT_S; ctx.fillRect(bx + col * cell, by, cell, size); }
    // queens
    ctx.textAlign = 'center';
    for (let c = 0; c < cols.length; c++) {
      const r = cols[c];
      const x = bx + c * cell + cell / 2, y = by + r * cell + cell / 2;
      ctx.beginPath(); ctx.arc(x, y, cell * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = solved ? GOOD : ACCENT; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = `600 ${Math.round(cell * 0.32)}px Inter`;
      ctx.fillText('Q', x, y + cell * 0.11);
    }
    // grid lines
    ctx.strokeStyle = RULE_H; ctx.lineWidth = 1;
    for (let i = 0; i <= N; i++) {
      ctx.beginPath(); ctx.moveTo(bx + i * cell, by); ctx.lineTo(bx + i * cell, by + size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx, by + i * cell); ctx.lineTo(bx + size, by + i * cell); ctx.stroke();
    }
    ctx.textAlign = 'left';

    setText('nq-placed', cols.length);
    setText('nq-bt', backtracks);
    setText('nq-status', done ? (solved ? 'solved' : 'no solution') : 'searching');
    $('nq-status').style.color = done ? (solved ? GOOD : BAD) : ACCENT;
  }
  function autosolve() {
    if (done) { draw(); return; }
    for (let k = 0; k < 2; k++) step();
    draw();
    if (!done) raf = requestAnimationFrame(autosolve);
  }
  $('nq-step').addEventListener('click', () => { if (raf) { cancelAnimationFrame(raf); raf = null; } step(); draw(); });
  $('nq-solve').addEventListener('click', () => { if (raf) cancelAnimationFrame(raf); autosolve(); });
  $('nq-reset').addEventListener('click', () => { reset(); draw(); });
  $('nq-n').addEventListener('input', () => { reset(); draw(); });
  window.addEventListener('resize', draw);
  reset(); draw();
})();

// ============================================================
// 11. STRUCTS — field alignment, padding, sizeof
// ============================================================
(function structs() {
  const cv = $('cv-struct'); if (!cv) return;
  const TYPES = { char: 1, short: 2, int: 4, double: 8 };
  const ORDERS = {
    cid: [['c', 'char'], ['i', 'int'], ['d', 'double']],
    dic: [['d', 'double'], ['i', 'int'], ['c', 'char']],
    cdc: [['a', 'char'], ['d', 'double'], ['b', 'char']],
    sci: [['s', 'short'], ['c', 'char'], ['i', 'int']],
  };
  // compute layout with alignment = type size; struct aligned to its largest member
  function layout(fields) {
    let offset = 0, maxAlign = 1;
    const cells = [];
    fields.forEach(([name, type]) => {
      const sz = TYPES[type], align = sz;
      maxAlign = Math.max(maxAlign, align);
      const pad = (align - (offset % align)) % align;
      for (let p = 0; p < pad; p++) cells.push({ pad: true });
      offset += pad;
      for (let b = 0; b < sz; b++) cells.push({ name, type, first: b === 0, size: sz });
      offset += sz;
    });
    const tailPad = (maxAlign - (offset % maxAlign)) % maxAlign;
    for (let p = 0; p < tailPad; p++) cells.push({ pad: true });
    offset += tailPad;
    return { cells, size: offset };
  }
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const fields = ORDERS[$('st-order').value];
    const { cells, size } = layout(fields);
    const dataBytes = fields.reduce((s, [, t]) => s + TYPES[t], 0);
    const pad = size - dataBytes;

    const cw = Math.min(38, (w - 40) / Math.max(1, cells.length)), x0 = (w - cw * cells.length) / 2, y0 = 70, ch = 50;
    ctx.textAlign = 'center';
    const palette = { c: ACCENT, i: WARN, d: GOOD, a: ACCENT, b: '#0EA5E9', s: '#9333EA' };
    cells.forEach((cell, k) => {
      const x = x0 + cw * k;
      if (cell.pad) { ctx.fillStyle = '#F0EFFA'; ctx.fillRect(x, y0, cw - 2, ch); ctx.strokeStyle = RULE_H; ctx.setLineDash([3, 3]); ctx.strokeRect(x, y0, cw - 2, ch); ctx.setLineDash([]); }
      else {
        const col = palette[cell.name] || ACCENT;
        ctx.fillStyle = col; ctx.globalAlpha = 0.18; ctx.fillRect(x, y0, cw - 2, ch); ctx.globalAlpha = 1;
        ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.strokeRect(x, y0, cw - 2, ch);
        if (cell.first) { ctx.fillStyle = col; ctx.font = '600 11px JetBrains Mono, monospace'; ctx.fillText(cell.name, x + (cw - 2) / 2, y0 + ch / 2); ctx.fillStyle = MUTED; ctx.font = '8px JetBrains Mono'; ctx.fillText(cell.type, x + (cw - 2) / 2 + (cell.size - 1) * cw / 2, y0 + ch / 2 + 13); }
      }
      ctx.fillStyle = MUTED; ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillText(k, x + (cw - 2) / 2, y0 + ch + 12);
    });
    ctx.fillStyle = INK_S; ctx.font = '12px Inter';
    ctx.fillText('struct S { ' + fields.map(([nm, t]) => `${t} ${nm};`).join(' ') + ' }', w / 2, 32);
    ctx.fillStyle = MUTED; ctx.font = '11px Inter';
    ctx.fillText('hatched = padding inserted for alignment · byte offsets below', w / 2, y0 + ch + 30);
    ctx.textAlign = 'left';

    setText('st-data', dataBytes + ' B');
    setText('st-pad', pad + ' B');
    setText('st-size', size + ' B');
  }
  $('st-order').addEventListener('change', draw);
  window.addEventListener('resize', draw);
  draw();
})();
