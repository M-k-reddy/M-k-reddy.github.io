// AlgoSolveo practice console: function-style problem harness (shared by the page and the build validator).
// A problem with kind "fn" or "design" is solved by writing a function/class; this file builds the
// full program (prelude + user code + driver) for each language, the starter code, and the checker.
(function (root) {
  "use strict";
  const MARK = "\u0002";
  const JT = { int: "int", long: "long", double: "double", bool: "boolean", string: "String", char: "char",
    "int[]": "int[]", "long[]": "long[]", "double[]": "double[]", "bool[]": "boolean[]", "string[]": "String[]", "char[]": "char[]",
    "int[][]": "int[][]", "string[][]": "String[][]", "char[][]": "char[][]", ListNode: "ListNode", TreeNode: "TreeNode", "ListNode[]": "ListNode[]",
    "list<int>": "List<Integer>", "list<long>": "List<Long>", "list<double>": "List<Double>", "list<bool>": "List<Boolean>", "list<string>": "List<String>",
    "list<list<int>>": "List<List<Integer>>", "list<list<string>>": "List<List<String>>", void: "void" };
  const JCONV = { int: "i", long: "l", double: "d", bool: "b", string: "s", char: "c", "int[]": "ia", "long[]": "la", "double[]": "da", "bool[]": "ba",
    "string[]": "sa", "char[]": "ca", "int[][]": "ia2", "string[][]": "sa2", "char[][]": "ca2", ListNode: "ln", TreeNode: "tn", "ListNode[]": "lna" };
  const PT = { int: "int", long: "int", double: "float", bool: "bool", string: "str", char: "str", "int[]": "List[int]", "long[]": "List[int]", "double[]": "List[float]",
    "bool[]": "List[bool]", "string[]": "List[str]", "char[]": "List[str]", "int[][]": "List[List[int]]", "string[][]": "List[List[str]]", "char[][]": "List[List[str]]",
    ListNode: "Optional[ListNode]", TreeNode: "Optional[TreeNode]", "ListNode[]": "List[Optional[ListNode]]",
    "list<int>": "List[int]", "list<long>": "List[int]", "list<double>": "List[float]", "list<bool>": "List[bool]", "list<string>": "List[str]",
    "list<list<int>>": "List[List[int]]", "list<list<string>>": "List[List[str]]", void: "None" };
  const JS = { int: "number", long: "number", double: "number", bool: "boolean", string: "string", char: "character", "int[]": "number[]", "long[]": "number[]",
    "double[]": "number[]", "bool[]": "boolean[]", "string[]": "string[]", "char[]": "character[]", "int[][]": "number[][]", "string[][]": "string[][]", "char[][]": "character[][]",
    ListNode: "ListNode", TreeNode: "TreeNode", "ListNode[]": "ListNode[]", "list<int>": "number[]", "list<long>": "number[]", "list<double>": "number[]", "list<bool>": "boolean[]",
    "list<string>": "string[]", "list<list<int>>": "number[][]", "list<list<string>>": "string[][]", void: "void" };
  const usesList = (p) => JSON.stringify(p.params || p.methods || []).includes("ListNode") || (p.ret || "").includes("ListNode") || JSON.stringify(p.methods || []).includes("ListNode");
  const usesTree = (p) => JSON.stringify([p.params, p.ret, p.methods]).includes("TreeNode");
  const JLIST = "/**\n * Definition for singly-linked list (already provided):\n * class ListNode { int val; ListNode next; ListNode() {} ListNode(int val) {...} ListNode(int val, ListNode next) {...} }\n */\n";
  const JTREE = "/**\n * Definition for a binary tree node (already provided):\n * class TreeNode { int val; TreeNode left, right; TreeNode() {} TreeNode(int val) {...} TreeNode(int val, TreeNode left, TreeNode right) {...} }\n */\n";
  const PLIST = "# Definition for singly-linked list (already provided):\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\n";
  const PTREE = "# Definition for a binary tree node (already provided):\n# class TreeNode:\n#     def __init__(self, val=0, left=None, right=None):\n#         self.val = val\n#         self.left = left\n#         self.right = right\n";
  const JSLIST = "/**\n * Definition for singly-linked list (already provided):\n * function ListNode(val, next) { this.val = val ?? 0; this.next = next ?? null; }\n */\n";
  const JSTREE = "/**\n * Definition for a binary tree node (already provided):\n * function TreeNode(val, left, right) { this.val = val ?? 0; this.left = left ?? null; this.right = right ?? null; }\n */\n";
  const jdef = { int: "0", long: "0L", double: "0.0", bool: "false", char: "' '", void: "" };

  function starter(lang, p) {
    const hdr = (a, b) => (usesList(p) ? a.l : "") + (usesTree(p) ? a.t : "");
    if (lang === "java") {
      const h = hdr({ l: JLIST, t: JTREE });
      const ret = (t) => (t === "void" ? "" : `        return ${t in jdef ? jdef[t] : "null"};\n`);
      if (p.kind === "design") {
        const body = p.methods.map(([n, ps, r], k) => k === 0
          ? `    public ${p.cls}(${ps.map(([a, t]) => JT[t] + " " + a).join(", ")}) {\n\n    }\n`
          : `    public ${JT[r]} ${n}(${ps.map(([a, t]) => JT[t] + " " + a).join(", ")}) {\n\n${ret(r)}    }\n`).join("\n");
        return `import java.util.*;\n\n${h}class ${p.cls} {\n\n${body}}\n`;
      }
      return `import java.util.*;\n\n${h}class Solution {\n    public ${JT[p.ret]} ${p.fn}(${p.params.map(([a, t]) => JT[t] + " " + a).join(", ")}) {\n\n${ret(p.ret)}    }\n}\n`;
    }
    if (lang === "python") {
      const h = hdr({ l: PLIST, t: PTREE });
      if (p.kind === "design") {
        const body = p.methods.map(([n, ps, r], k) => k === 0
          ? `    def __init__(self${ps.map(([a, t]) => `, ${a}: ${PT[t]}`).join("")}):\n        pass\n`
          : `    def ${n}(self${ps.map(([a, t]) => `, ${a}: ${PT[t]}`).join("")}) -> ${PT[r]}:\n        pass\n`).join("\n");
        return `${h}class ${p.cls}:\n\n${body}`;
      }
      return `${h}class Solution:\n    def ${p.fn}(self${p.params.map(([a, t]) => `, ${a}: ${PT[t]}`).join("")}) -> ${PT[p.ret]}:\n        pass\n`;
    }
    const h = hdr({ l: JSLIST, t: JSTREE });
    if (p.kind === "design") {
      const body = p.methods.map(([n, ps, r], k) => {
        const doc = `    /**\n${ps.map(([a, t]) => `     * @param {${JS[t]}} ${a}\n`).join("")}${k && r !== "void" ? `     * @return {${JS[r]}}\n` : ""}     */\n`;
        return k === 0 ? `${doc}    constructor(${ps.map((x) => x[0]).join(", ")}) {\n\n    }\n` : `${doc}    ${n}(${ps.map((x) => x[0]).join(", ")}) {\n\n    }\n`;
      }).join("\n");
      return `${h}class ${p.cls} {\n${body}}\n`;
    }
    return `${h}/**\n${p.params.map(([a, t]) => ` * @param {${JS[t]}} ${a}\n`).join("")} * @return {${JS[p.ret]}}\n */\nfunction ${p.fn}(${p.params.map((x) => x[0]).join(", ")}) {\n\n}\n`;
  }

  // ---------- program builders ----------
  const PY_PRE = 'exec("import json as __json, sys as __sys\\n__sys.setrecursionlimit(4000)\\nfrom typing import *\\nimport collections, heapq, bisect, math, itertools, functools\\nfrom collections import *\\nfrom heapq import *\\nfrom bisect import *\\nfrom functools import *\\nfrom itertools import *\\nfrom math import inf\\nclass ListNode:\\n    def __init__(self, val=0, next=None):\\n        self.val = val\\n        self.next = next\\nclass TreeNode:\\n    def __init__(self, val=0, left=None, right=None):\\n        self.val = val\\n        self.left = left\\n        self.right = right\\n")\n';
  const PY_DRV = `
def __mk_list(a):
    d = t = ListNode(0)
    for x in a:
        t.next = ListNode(x); t = t.next
    return d.next
def __mk_tree(a):
    if not a or a[0] is None: return None
    r = TreeNode(a[0]); q = [r]; i = 1; h = 0
    while h < len(q) and i < len(a):
        n = q[h]; h += 1
        if i < len(a) and a[i] is not None: n.left = TreeNode(a[i]); q.append(n.left)
        i += 1
        if i < len(a) and a[i] is not None: n.right = TreeNode(a[i]); q.append(n.right)
        i += 1
    return r
def __to(t, v):
    if t == "ListNode": return __mk_list(v)
    if t == "TreeNode": return __mk_tree(v)
    if t == "ListNode[]": return [__mk_list(x) for x in v]
    if t == "double": return float(v)
    return v
def __plain(x, depth=0):
    if isinstance(x, ListNode):
        o = []; k = 0
        while x is not None and k < 200000: o.append(x.val); x = x.next; k += 1
        return o
    if isinstance(x, TreeNode):
        o = []; q = [x]; h = 0
        while h < len(q) and len(o) < 400000:
            n = q[h]; h += 1
            if n is None: o.append(None); continue
            o.append(n.val); q.append(n.left); q.append(n.right)
        while o and o[-1] is None: o.pop()
        return o
    if isinstance(x, (list, tuple, set, frozenset)) or type(x).__name__ in ("deque",):
        return [__plain(y, depth + 1) for y in x]
    if isinstance(x, float) and x != x: return None
    return x
def __emit(x):
    __sys.stdout.flush()
    print("\\x02" + __json.dumps(__plain(x), separators=(",", ":"), ensure_ascii=False))
__L = [l.strip() for l in __sys.stdin.read().split("\\n") if l.strip()]
def __line(i):
    if i >= len(__L): raise ValueError("Input is missing line %d (one JSON value per parameter)." % (i + 1))
    return __json.loads(__L[i])
`;
  const JS_PRE = 'function ListNode(val, next) { this.val = val === undefined ? 0 : val; this.next = next === undefined ? null : next; } function TreeNode(val, left, right) { this.val = val === undefined ? 0 : val; this.left = left === undefined ? null : left; this.right = right === undefined ? null : right; }\n';
  const JS_DRV = `
;(() => {
const __L = input.split("\\n").map((l) => l.trim()).filter((l) => l);
const __line = (i) => { if (i >= __L.length) throw new Error("Input is missing line " + (i + 1) + " (one JSON value per parameter)."); return JSON.parse(__L[i]); };
const __mkList = (a) => { const d = new ListNode(0); let t = d; for (const x of a) { t.next = new ListNode(x); t = t.next; } return d.next; };
const __mkTree = (a) => { if (!a.length || a[0] === null) return null; const r = new TreeNode(a[0]); const q = [r]; let i = 1, h = 0;
  while (h < q.length && i < a.length) { const n = q[h++]; if (i < a.length && a[i] !== null) { n.left = new TreeNode(a[i]); q.push(n.left); } i++; if (i < a.length && a[i] !== null) { n.right = new TreeNode(a[i]); q.push(n.right); } i++; } return r; };
const __to = (t, v) => t === "ListNode" ? __mkList(v) : t === "TreeNode" ? __mkTree(v) : t === "ListNode[]" ? v.map(__mkList) : v;
const __plain = (x) => {
  if (x instanceof ListNode) { const o = []; let k = 0; while (x && k++ < 200000) { o.push(x.val); x = x.next; } return o; }
  if (x instanceof TreeNode) { const o = [], q = [x]; let h = 0; while (h < q.length && o.length < 400000) { const n = q[h++]; if (!n) { o.push(null); continue; } o.push(n.val); q.push(n.left, n.right); } while (o.length && o[o.length - 1] === null) o.pop(); return o; }
  if (x === undefined) return null;
  if (typeof x === "bigint") return Number(x);
  if (x instanceof Set) return [...x].map(__plain);
  if (Array.isArray(x) || ArrayBuffer.isView(x)) return Array.from(x, __plain);
  return x;
};
const __emit = (x) => console.log("${MARK}" + JSON.stringify(__plain(x)));
__BODY__
})();
`;

  function program(lang, p, code) {
    if (lang === "java") {
      let src = code.replace(/\bpublic\s+(final\s+)?class\s+(Solution|Main\b)/g, "class $2").replace(new RegExp("\\bpublic\\s+(final\\s+)?class\\s+" + (p.cls || "Solution") + "\\b"), "class " + (p.cls || "Solution"));
      let body;
      if (p.kind === "design") body = `        AsJ.design(${p.cls}.class, AsJ.line(L, 0), AsJ.line(L, 1));\n`;
      else {
        const args = p.params.map(([a, t], k) => `AsJ.${JCONV[t]}(AsJ.line(L, ${k}))`);
        const decl = p.params.map(([a, t], k) => `        ${JT[t]} a${k} = ${args[k]};\n`).join("");
        const call = `new Solution().${p.fn}(${p.params.map((_, k) => "a" + k).join(", ")})`;
        body = decl + (p.ret === "void" ? `        ${call};\n        AsJ.out(a${p.out});\n` : `        Object r = ${call};\n        AsJ.out(r);\n`);
      }
      return src + `\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        String[] L = AsJ.lines();\n${body}    }\n}\n`;
    }
    if (lang === "python") {
      let drv;
      if (p.kind === "design") {
        const tmap = {}; p.methods.forEach(([n, ps], k) => { tmap[k === 0 ? "__init__" : n] = ps.map((x) => x[1]); });
        drv = `__T = ${JSON.stringify(tmap)}
__ops = __line(0); __args = __line(1); __out = [None]
__obj = ${p.cls}(*[__to(t, v) for t, v in zip(__T["__init__"], __args[0])])
for __m, __a in zip(__ops[1:], __args[1:]):
    __out.append(getattr(__obj, __m)(*[__to(t, v) for t, v in zip(__T.get(__m, []), __a)]))
__emit(__out)
`;
      } else {
        const conv = p.params.map(([a, t], k) => `__to(${JSON.stringify(t)}, __line(${k}))`).join(", ");
        drv = `__a = [${conv}]\n__r = Solution().${p.fn}(*__a)\n` + (p.ret === "void" ? `__emit(__a[${p.out}])\n` : `__emit(__r)\n`);
      }
      return PY_PRE + code + "\n" + PY_DRV + drv;
    }
    let body;
    if (p.kind === "design") {
      const tmap = {}; p.methods.forEach(([n, ps], k) => { tmap[k === 0 ? "constructor" : n] = ps.map((x) => x[1]); });
      body = `const __T = ${JSON.stringify(tmap)}; const __ops = __line(0), __args = __line(1); const __out = [null];
const __obj = new ${p.cls}(...__args[0].map((v, k) => __to((__T.constructor || [])[k], v)));
for (let k = 1; k < __ops.length; k++) { if (typeof __obj[__ops[k]] !== "function") throw new Error("Method " + __ops[k] + " not found in ${p.cls}"); const r = __obj[__ops[k]](...__args[k].map((v, j) => __to((__T[__ops[k]] || [])[j], v))); __out.push(r === undefined ? null : r); }
__emit(__out);`;
    } else {
      body = `if (typeof ${p.fn} !== "function") throw new Error("Define a function named ${p.fn}");
const __a = [${p.params.map(([a, t], k) => `__to(${JSON.stringify(t)}, __line(${k}))`).join(", ")}];
const __r = ${p.fn}(...__a);
__emit(${p.ret === "void" ? `__a[${p.out}]` : "__r"});`;
    }
    return JS_PRE + code + "\n" + JS_DRV.replace("__BODY__", body);
  }

  // Split program output into what the user printed and the returned value.
  function extract(out) {
    const s = String(out || "");
    const i = s.lastIndexOf(MARK);
    if (i < 0) return { stdout: s, result: null };
    const j = s.indexOf("\n", i);
    return { stdout: (s.slice(0, i) + (j < 0 ? "" : s.slice(j + 1))).replace(/\n+$/, ""), result: s.slice(i + 1, j < 0 ? undefined : j).trim() };
  }

  // ---------- checker ----------
  const key = (v) => JSON.stringify(v);
  function normNum(v) {
    if (Array.isArray(v)) return v.map(normNum);
    if (typeof v === "number" && !Number.isInteger(v)) return Math.round(v * 1e5) / 1e5;
    return v;
  }
  function eq(a, b) {
    if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) <= 1e-5 * Math.max(1, Math.abs(b));
    if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => eq(x, b[i]));
    return a === b;
  }
  const sortArr = (v) => (Array.isArray(v) ? v.slice().sort((x, y) => (key(normNum(x)) < key(normNum(y)) ? -1 : key(normNum(x)) > key(normNum(y)) ? 1 : 0)) : v);
  function canon(mode, v) {
    if (mode === "sorted") return sortArr(v);
    if (mode === "sorted2") return Array.isArray(v) ? sortArr(v.map(sortArr)) : v;
    return v;
  }
  function check(p, got, exp) {
    let g, e;
    try { g = JSON.parse(got); } catch (_) { return false; }
    e = JSON.parse(exp);
    return eq(canon(p.compare, g), canon(p.compare, e));
  }

  const api = { starter, program, extract, check, MARK };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.ASWrap = api;
})(typeof self !== "undefined" ? self : this);
