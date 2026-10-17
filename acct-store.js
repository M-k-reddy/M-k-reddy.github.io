// AlgoSolveo: practice progress per account ("as_" keys), synced to Supabase so it follows you across devices.
(function () {
  try {
    var SB = "https://qxlmqxslpwqbrisywzsp.supabase.co", KEY = "sb_publishable_xnrdX1gkErcDhVHZf2l7yA_dFMQSa5k";
    var P = Storage.prototype, g = P.getItem, s = P.setItem, r = P.removeItem, ls = window.localStorage, uid = "", tok = "";
    try { var t = JSON.parse(g.call(ls, "sb-qxlmqxslpwqbrisywzsp-auth-token") || "null"); t = t && (t.currentSession || t);
      uid = (t && t.user && t.user.id) || ""; if (t && t.access_token && (!t.expires_at || t.expires_at * 1000 > Date.now() + 30000)) tok = t.access_token; } catch (_) {}
    if (!uid) return; // signed out: guest progress uses the plain keys
    var pre = "u:" + uid + ":", TS = pre + "as__ts";
    var own = function (k) { return typeof k === "string" && k.indexOf("as_") === 0 && k.indexOf("as__") !== 0; };
    if (!g.call(ls, "as__claimed")) { // first account on this browser takes the old shared progress
      var keys = []; for (var i = 0; i < ls.length; i++) { var k = ls.key(i); if (own(k)) keys.push(k); }
      keys.forEach(function (k) { if (g.call(ls, pre + k) === null) s.call(ls, pre + k, g.call(ls, k)); r.call(ls, k); });
      s.call(ls, "as__claimed", uid);
    }
    function snapshot() { var o = {}; for (var i = 0; i < ls.length; i++) { var k = ls.key(i); if (k.indexOf(pre + "as_") === 0 && k !== TS) o[k.slice(pre.length)] = g.call(ls, k); } return o; }
    var H = { apikey: KEY, "Content-Type": "application/json" };
    function push(keep) {
      if (!tok) return; var body = JSON.stringify({ user_id: uid, data: snapshot(), updated_at: new Date().toISOString() });
      try { fetch(SB + "/rest/v1/user_progress?on_conflict=user_id", { method: "POST", keepalive: !!keep, headers: Object.assign({ Authorization: "Bearer " + tok, Prefer: "resolution=merge-duplicates,return=minimal" }, H), body: body }); } catch (_) {}
    }
    var timer = 0, dirty = false;
    function later() { dirty = true; s.call(ls, TS, String(Date.now())); clearTimeout(timer); timer = setTimeout(function () { dirty = false; push(); }, 2500); }
    addEventListener("pagehide", function () { if (dirty) push(true); });
    P.getItem = function (k) { return g.call(this, this === ls && own(k) ? pre + k : k); };
    P.setItem = function (k, v) { var o = this === ls && own(k); s.call(this, o ? pre + k : k, v); if (o) later(); };
    P.removeItem = function (k) { var o = this === ls && own(k); r.call(this, o ? pre + k : k); if (o) later(); };
    if (!tok) return;
    // pull: merge what other devices saved
    fetch(SB + "/rest/v1/user_progress?select=data,updated_at&user_id=eq." + uid, { headers: Object.assign({ Authorization: "Bearer " + tok }, H) })
      .then(function (x) { return x.ok ? x.json() : null; }).then(function (rows) {
        if (!rows) return; var row = rows[0], local = snapshot(), changed = false;
        if (!row) { if (Object.keys(local).length) push(); return; }
        var rem = row.data || {}, remT = Date.parse(row.updated_at) || 0, locT = +g.call(ls, TS) || 0;
        var J = function (v) { try { return JSON.parse(v); } catch (_) { return null; } };
        Object.keys(rem).forEach(function (k) {
          var rv = rem[k], lv = local[k], out = rv;
          if (lv != null && lv !== rv) {
            var a = J(lv), b = J(rv);
            if (Array.isArray(a) && Array.isArray(b)) out = JSON.stringify(Array.from(new Set(a.concat(b))));
            else if (a && b && typeof a === "object" && typeof b === "object" && /^as_(solve_log|days|tried|quiz_stats|sol_seen)$/.test(k)) {
              var m = Object.assign({}, b, a); if (k === "as_solve_log") Object.keys(b).forEach(function (id) { if (a[id] && b[id].last > a[id].last) m[id] = b[id]; });
              if (k === "as_days") Object.keys(b).forEach(function (d) { m[d] = Math.max(a[d] || 0, b[d] || 0); });
              out = JSON.stringify(m);
            } else out = remT > locT ? rv : lv;
          }
          if (out !== lv) { s.call(ls, pre + k, out); changed = true; }
        });
        var after = snapshot(); if (JSON.stringify(after) !== JSON.stringify(rem)) push();
        if (changed && !sessionStorage.getItem("as__synced")) { sessionStorage.setItem("as__synced", "1"); location.reload(); }
      }).catch(function () {});
  } catch (_) {}
})();
