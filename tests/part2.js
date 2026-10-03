// 第二部：四种开局各随机走 N 局，查报错、结局分布、1989 年的数字。
// 用法：node tests/part2.js [每种开局的局数，默认 40]
const { chromium } = require("playwright");
const path = require("path");
const N = +process.argv[2] || 40;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const errs = [];
  p.on("pageerror", e => errs.push(String(e)));
  p.on("console", m => { if ((m.type() === "error" || m.type() === "warning") && !/ERR_TUNNEL|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto("file://" + path.resolve(__dirname, "../梦与非梦_第二部.html"), { waitUntil: "domcontentloaded" });
  const res = {}, bad = [];
  for (const w of ["W", "R", "C", "G"]) for (let g = 0; g < N; g++) {
  await p.evaluate(([w, g, N]) => {
    const M = window.__mfm2;
    const res = window.__res = window.__res || {};
    let seed = 7 + g * 7919 + w.charCodeAt(0); const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const bad = window.__bad = window.__bad || [];
    {
      const r = res[w] = res[w] || { ends: {}, early: 0, wage: [], price: [], farm: [], house: [], debt: [], jobless: [], fails: 0, votes: 0, cards: {} };
      {
        const o = M.SAMPLES[w];
        M.newGame(o.code, o.x); M.startYear(1978); M.render();
        let guard = 0;
        while (M.st.page !== "end" && guard++ < 400) {
          const st = M.st;
          if (st.page === "card") {
            const card = M.CARDS2.find(c => c.id === st.q[st.qi]);
            r.cards[card.id] = (r.cards[card.id] || 0) + 1;
            const txt = M.R(card.text);
            if (!txt || txt.length < 50) bad.push(w + " 空正文 " + card.id);
            const list = M.opts(card).map((c, i) => [c, i]).filter(([c]) => M.ev(c.req));
            if (!list.length) { bad.push(w + " 没有可选 " + card.id); break; }
            const [c, i] = list[Math.floor(rnd() * list.length)];
            M.choose(i);
            const rr = M.st.res;
            if (rr.t) { r.votes++; if (!rr.t.pass) r.fails++; }
            const a = M.opts(card)[rr.ai];
            if (a && !M.R(a.res)) bad.push(w + " 空结果 " + card.id + " " + (a.set || a.eff.set)[0]);
            M.render();
            M.nextFromRes();
          } else if (st.page === "year") { M.render(); M.nextFromYear(); }
          else { bad.push("卡住 " + st.page); break; }
        }
        M.render();
        const st = M.st;
        const k = st.endKey; r.ends[k] = (r.ends[k] || 0) + 1;
        const e = M.ENDINGS2.find(x => x.k === k);
        if (!e) bad.push("没有结局 " + k);
        else if (M.R(e.text).length < 50) bad.push(w + " 结局正文空 " + k);
        if (k.startsWith("e2_out")) r.early++;
        else for (const x of ["wage", "price", "farm", "house", "debt", "jobless"]) r[x].push(Math.round(st.ind[x]));
      }
      if (g === N - 1) for (const x of ["wage", "price", "farm", "house", "debt", "jobless"]) { const a = r[x].sort((p, q) => p - q); r[x] = a.length ? [a[0], a[a.length >> 1], a[a.length - 1]] : []; }
    }
  }, [w, g, N]);
  }
  const out = await p.evaluate(() => ({ res: window.__res, bad: [...new Set(window.__bad)].slice(0, 40) }));
  console.log(JSON.stringify(out.res, null, 1));
  console.log("问题", out.bad);
  console.log("报错", [...new Set(errs)].slice(0, 20));
  await b.close();
  if (out.bad.length || errs.length) process.exitCode = 1;
})();
