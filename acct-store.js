// AlgoSolveo: keep practice progress separate for each signed-in account (keys starting "as_").
(function () {
  try {
    var P = Storage.prototype, g = P.getItem, s = P.setItem, r = P.removeItem, ls = window.localStorage, uid = "";
    try { var t = JSON.parse(g.call(ls, "sb-qxlmqxslpwqbrisywzsp-auth-token") || "null"); t = t && (t.currentSession || t); uid = (t && t.user && t.user.id) || ""; } catch (_) {}
    if (!uid) return; // signed out: guest progress uses the plain keys
    var pre = "u:" + uid + ":";
    var own = function (k) { return typeof k === "string" && k.indexOf("as_") === 0; };
    // first account to sign in on this browser takes over the guest progress made before accounts were separated
    if (!g.call(ls, "as__claimed")) {
      var keys = [];
      for (var i = 0; i < ls.length; i++) { var k = ls.key(i); if (own(k)) keys.push(k); }
      keys.forEach(function (k) { if (g.call(ls, pre + k) === null) s.call(ls, pre + k, g.call(ls, k)); r.call(ls, k); });
      s.call(ls, "as__claimed", uid);
    }
    P.getItem = function (k) { return g.call(this, this === ls && own(k) ? pre + k : k); };
    P.setItem = function (k, v) { return s.call(this, this === ls && own(k) ? pre + k : k, v); };
    P.removeItem = function (k) { return r.call(this, this === ls && own(k) ? pre + k : k); };
  } catch (_) {}
})();
