// AlgoSolveo practice progress: solved set, solve history and spaced-revision schedule (stored in this browser).
(function (root) {
  "use strict";
  const DAY = 864e5;
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) {} },
  };
  // Review gaps in days after each successful solve. Solving with the solution open restarts at 1 day.
  const GAPS = [3, 7, 21, 60];
  const dk = (t) => { const d = new Date(t); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const solvedSet = () => new Set(LS.get("as_practice_solved", []));
  function history() {
    const h = LS.get("as_solve_log", null);
    if (h) return h;
    // first run: seed problems solved before revision existed, so they come back for review in a few days
    const now = Date.now(), seed = {};
    [...solvedSet()].forEach((id) => { seed[id] = { first: now, last: now, step: 0, due: now + GAPS[0] * DAY, help: false }; });
    LS.set("as_solve_log", seed);
    return seed;
  }
  function usedHelp(id) { return !!LS.get("as_sol_seen", {})[id]; }
  function markHelp(id) { const m = LS.get("as_sol_seen", {}); m[id] = Date.now(); LS.set("as_sol_seen", m); }
  // Call on every Accepted submit. Returns the entry.
  function recordAccept(id) {
    const h = history(), now = Date.now();
    const help = usedHelp(id);
    let e = h[id];
    if (!e) e = { first: now, last: now, step: 0, help };
    else if (now >= e.due - DAY / 2) { e.step = help ? 0 : Math.min(e.step + 1, GAPS.length - 1); e.last = now; }
    else e.last = now; // re-solved early: keep schedule
    e.help = help;
    e.due = now + (help && e.step === 0 ? 1 : GAPS[e.step]) * DAY;
    h[id] = e; LS.set("as_solve_log", h);
    const m = LS.get("as_sol_seen", {}); delete m[id]; LS.set("as_sol_seen", m); // help applies to one attempt only
    const s = solvedSet(); s.add(id); LS.set("as_practice_solved", [...s]);
    const days = LS.get("as_days", {}); const d = dk(Date.now()); days[d] = (days[d] || 0) + 1; LS.set("as_days", days);
    return e;
  }
  function due(now) { now = now || Date.now(); const h = history(); return Object.keys(h).filter((id) => h[id].due <= now).sort((a, b) => h[a].due - h[b].due); }
  function upcoming(days) { const now = Date.now(), h = history(); return Object.keys(h).filter((id) => h[id].due > now && h[id].due <= now + days * DAY).sort((a, b) => h[a].due - h[b].due); }
  function streak() {
    const days = LS.get("as_days", {}); let n = 0; const t = new Date();
    for (let i = 0; i < 400; i++) { const d = dk(t - i * DAY); if (days[d]) n++; else if (i > 0) break; }
    return n;
  }
  root.ASProgress = { LS, DAY, GAPS, solvedSet, history, recordAccept, markHelp, usedHelp, due, upcoming, streak };
})(typeof window !== "undefined" ? window : this);
