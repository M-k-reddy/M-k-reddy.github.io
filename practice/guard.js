// Inserts algosolveo.G.t(); at the start of every for/while/do loop body (skips strings & comments).
function guardJava(src) {
  const G = "algosolveo.G.t();";
  let out = "", i = 0, n = src.length;
  const isId = (c) => /[A-Za-z0-9_$]/.test(c || "");
  function skipWs(j) {
    while (j < n) {
      if (/\s/.test(src[j])) j++;
      else if (src.startsWith("//", j)) { while (j < n && src[j] !== "\n") j++; }
      else if (src.startsWith("/*", j)) { const e = src.indexOf("*/", j + 2); j = e < 0 ? n : e + 2; }
      else break;
    }
    return j;
  }
  function skipLit(j) { // j at quote
    const q = src[j];
    if (q === '"' && src.startsWith('"""', j)) { const e = src.indexOf('"""', j + 3); return e < 0 ? n : e + 3; }
    j++;
    while (j < n && src[j] !== q && src[j] !== "\n") { if (src[j] === "\\") j++; j++; }
    return j + 1;
  }
  function matchParen(j) { // j at '('
    let d = 0;
    while (j < n) {
      const c = src[j];
      if (c === '"' || c === "'") { j = skipLit(j); continue; }
      if (src.startsWith("//", j) || src.startsWith("/*", j)) { j = skipWs(j); continue; }
      if (c === "(") d++;
      else if (c === ")") { d--; if (d === 0) return j + 1; }
      j++;
    }
    return n;
  }
  const closes = [];
  function stmtEnd(j) { // index of ';' ending a simple statement starting at j
    let d = 0;
    while (j < n) {
      const c = src[j];
      if (c === '"' || c === "'") { j = skipLit(j); continue; }
      if (src.startsWith("//", j) || src.startsWith("/*", j)) { j = skipWs(j); continue; }
      if (c === "(" || c === "{" || c === "[") d++;
      else if (c === ")" || c === "}" || c === "]") d--;
      else if (c === ";" && d === 0) return j;
      j++;
    }
    return -1;
  }
  while (i < n) {
    while (closes.length && closes[closes.length - 1] === i) { out += "}"; closes.pop(); }
    const c = src[i];
    if (c === '"' || c === "'") { const e = skipLit(i); out += src.slice(i, e); i = e; continue; }
    if (src.startsWith("//", i) || src.startsWith("/*", i)) { const e = skipWs(i); out += src.slice(i, e); i = e; continue; }
    let kw = null;
    if (!isId(src[i - 1])) for (const k of ["for", "while", "do"]) if (src.startsWith(k, i) && !isId(src[i + k.length])) { kw = k; break; }
    if (!kw) { out += c; i++; continue; }
    let j = i + kw.length;
    if (kw !== "do") {
      const p = skipWs(j);
      if (src[p] !== "(") { out += src.slice(i, j); i = j; continue; }
      j = matchParen(p);
    }
    const b = skipWs(j);
    if (src[b] === "{") { out += src.slice(i, b + 1) + G; i = b + 1; }
    else if (src[b] === ";" && kw === "while") {
      // either `while(x);` empty loop, or the tail of do{...}while(x);  -> leave do-while tails alone
      const prev = out.replace(/\s+$/, "");
      if (prev.endsWith("}")) { out += src.slice(i, b + 1); i = b + 1; }
      else { out += src.slice(i, j) + "{" + G + "}"; i = b + 1; }
    }
    else {
      const w = (src.slice(b).match(/^[A-Za-z_$][\w$]*/) || [""])[0];
      const e = ["if", "for", "while", "do", "switch", "try", "synchronized"].includes(w) ? -1 : stmtEnd(b);
      if (e > 0) { out += src.slice(i, b) + "{" + G; closes.push(e + 1); i = b; }
      else { out += src.slice(i, j); i = j; }
    }
  }
  while (closes.length) { out += "}"; closes.pop(); }
  return out;
}
if (typeof module !== "undefined") module.exports = guardJava;
