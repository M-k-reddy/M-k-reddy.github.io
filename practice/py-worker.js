// AlgoSolveo practice console: Python via Pyodide, one test per message.
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");
let py = null;
const boot = (async () => {
  py = await loadPyodide();
  py.runPython(`
import sys, io, traceback, time
def __as_run(code, data):
    out, err = io.StringIO(), io.StringIO()
    sys.stdin, sys.stdout, sys.stderr = io.StringIO(data), out, err
    status = "OK"
    try:
        exec(compile(code, "solution.py", "exec"), {"__name__": "__main__"})
    except SystemExit:
        pass
    except BaseException:
        status = "RE"
        tb = traceback.format_exc().splitlines()
        keep = [l for l in tb if "__as_run" not in l and "<exec>" not in l]
        err.write("\\n".join(keep[-6:]))
    finally:
        sys.stdin, sys.stdout, sys.stderr = sys.__stdin__, sys.__stdout__, sys.__stderr__
    return [status, out.getvalue()[:20000], err.getvalue()]
`);
  self.postMessage({ ready: true });
})();
self.onmessage = async (e) => {
  await boot;
  const { id, code, input } = e.data;
  const t0 = performance.now();
  try {
    const fn = py.globals.get("__as_run");
    const r = fn(code, input);
    const [s, o, er] = r.toJs();
    r.destroy();
    self.postMessage({ id, s, o, e: er, t: Math.round(performance.now() - t0) });
  } catch (err) {
    self.postMessage({ id, s: "RE", o: "", e: String(err), t: Math.round(performance.now() - t0) });
  }
};
