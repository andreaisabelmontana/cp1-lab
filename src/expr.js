// Arithmetic expression engine (demo 2).
// A small recursive-descent parser over the C operator grammar (+ - * / % and
// parentheses, unary minus) producing an AST, plus an evaluator that models
// either C int arithmetic (truncating / and %) or double arithmetic.

// Split source text into tokens. Numbers, the operators + - * / %, and ( ).
export function tokenize(src) {
  const toks = [];
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === ' ' || c === '\t') continue;
    if (/[0-9.]/.test(c)) {
      let num = c;
      while (i + 1 < src.length && /[0-9.]/.test(src[i + 1])) num += src[++i];
      toks.push({ t: 'num', v: parseFloat(num) });
    } else if ('+-*/%()'.includes(c)) {
      toks.push({ t: c });
    } else {
      throw new Error(`unexpected "${c}"`);
    }
  }
  return toks;
}

// Parse a token list into an AST. Precedence: * / % bind tighter than + -.
// Grammar: expr := term (('+'|'-') term)*
//          term := atom (('*'|'/'|'%') atom)*
//          atom := num | '(' expr ')' | '-' atom
export function parse(toks) {
  let i = 0;
  const peek = () => toks[i];
  function atom() {
    const tk = peek();
    if (!tk) throw new Error('unexpected end');
    if (tk.t === 'num') { i++; return { op: 'num', v: tk.v }; }
    if (tk.t === '(') {
      i++; const e = expr();
      if (!toks[i] || toks[i].t !== ')') throw new Error('missing )');
      i++; return e;
    }
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

// Evaluate an AST. When asInt is true, model C integer arithmetic: operands are
// truncated and division truncates toward zero.
export function evalNode(node, asInt) {
  switch (node.op) {
    case 'num': return asInt ? Math.trunc(node.v) : node.v;
    case 'neg': return -evalNode(node.a, asInt);
    case '+': return evalNode(node.a, asInt) + evalNode(node.b, asInt);
    case '-': return evalNode(node.a, asInt) - evalNode(node.b, asInt);
    case '*': return evalNode(node.a, asInt) * evalNode(node.b, asInt);
    case '/': {
      const a = evalNode(node.a, asInt), b = evalNode(node.b, asInt);
      return asInt ? Math.trunc(a / b) : a / b;
    }
    case '%': {
      const a = evalNode(node.a, asInt), b = evalNode(node.b, asInt);
      return a % b;
    }
  }
  throw new Error(`unknown op ${node.op}`);
}

// Convenience: tokenize -> parse -> evaluate a source string.
export function evaluate(src, asInt) {
  const toks = tokenize(src);
  if (toks.length === 0) throw new Error('empty');
  return evalNode(parse(toks), asInt);
}
