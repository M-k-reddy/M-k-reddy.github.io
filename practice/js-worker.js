// AlgoSolveo practice console: runs one JavaScript test per message.
self.onmessage = (e) => {
  const { id, code, input } = e.data;
  const out = [];
  const fmt = (a) => a.map((x) => (typeof x === "string" ? x : (() => { try { return JSON.stringify(x); } catch (_) { return String(x); } })())).join(" ");
  const con = { log: (...a) => out.push(fmt(a)), info: (...a) => out.push(fmt(a)), warn: (...a) => out.push(fmt(a)), error: (...a) => out.push(fmt(a)) };
  const lines = input.split("\n");
  let li = 0;
  const readline = () => (li < lines.length ? lines[li++] : "");
  const t0 = performance.now();
  try {
    new Function("input", "console", "readline", '"use strict";\n' + code)(input, con, readline);
    self.postMessage({ id, s: "OK", o: out.join("\n") + (out.length ? "\n" : ""), e: "", t: Math.round(performance.now() - t0) });
  } catch (err) {
    self.postMessage({ id, s: "RE", o: out.join("\n"), e: String(err && err.stack ? err.stack.split("\n").slice(0, 3).join("\n") : err), t: Math.round(performance.now() - t0) });
  }
};
self.postMessage({ ready: true });
