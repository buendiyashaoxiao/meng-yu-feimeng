// 第一部到第二部：把第一部的状态摆到三种台上的结局（W、R、C；G2 要靠 1976 年 10 月的名单算，这里不摆）和一种不在台上的结局，
// 看结局页有没有“进入第二部”，点进去能不能开局，世界对不对。
const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '..', '梦与非梦.html');
const CASES = [
  ['W', ['z_k6'], ['elect','no_rename','tw_quota','w1_both','w2_redress'], 'W'],
  ['R', ['z_hua'], ['r1_deng','r2_mid','e6_cover','add_temp'], 'R'],
  ['C', ['z_co'], ['c1_half','c2_wage','tw_quota'], 'C'],
  ['H', ['z_hist'], [], null]
];
(async()=>{
  const b = await chromium.launch(); const errs = []; let fails = 0;
  const p = await b.newPage(); p.on('pageerror', e=>errs.push(e.message)); await p.route(/fonts\./, r=>r.abort());
  for(const [name, pathK, facts, want] of CASES){
    await p.goto(FILE);
    const ok = await p.evaluate(([pathK, facts, name])=>{
      const M = window.__mfm, st = M.st;
      st.path = pathK.slice(); st.facts = (facts||[]).slice(); st.world = null;
      M.go('endw'); return !!document.querySelector('.world');
    }, [pathK, facts, name]);
    const link = await p.$('a[href^="梦与非梦_第二部.html"]');
    const w = await p.evaluate(()=>{ const s = window.__mfm.st; return s.world && s.world.t + s.world.s; });
    console.log(name, w, ok ? '' : '没有世界线面板', link ? '有入口' : '没有入口');
    if(!!link !== !!want){ fails++; continue; }
    if(!link) continue;
    const href = await link.getAttribute('href');
    const p2 = await b.newPage(); p2.on('pageerror', e=>errs.push(e.message)); await p2.route(/fonts\./, r=>r.abort());
    await p2.goto(FILE.replace('梦与非梦.html', '') + href, {waitUntil:'domcontentloaded'});
    await p2.evaluate(()=>localStorage.removeItem('mfm2-save')); await p2.reload({waitUntil:'domcontentloaded'});
    await p2.click('[data-act="go"]');
    const r = await p2.evaluate(()=>{ const s = window.__mfm2.st; return s ? {w:s.w, page:s.page, flags:s.flags} : null; });
    console.log('  第二部', JSON.stringify(r));
    if(!r || r.w!==want || r.page!=='intro') fails++;
    await p2.close();
  }
  console.log(fails ? `失败 ${fails}` : '全部通过', errs.slice(0,5));
  await b.close(); process.exit(fails||errs.length ? 1 : 0);
})();
