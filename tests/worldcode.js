// 世界线代码：五种人各走一局到结局页，取代码、解码、和这一局的状态逐项比对；再改错一个字，看校验位能不能发现。
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const FILE = 'file://' + require('path').resolve(__dirname, '..', '梦与非梦.html');
const DEATH = ['harsh','add_name','go_ks','seize_alone','bunker','ll_dinner','cs_worst','call_sh','jb_false','go_home','k1_arm','k2_fight','hard'];
(async()=>{
  const b = await chromium.launch(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {});
  const errs = []; let fails = 0;
  const p = await b.newPage({viewport:{width:360,height:780}});
  p.on('pageerror', e=>errs.push(e.message)); await p.route(/fonts\./, r=>r.abort());
  for(const pol of ['history','ladder','hand','voice','clean']){
    await p.goto(FILE); await p.evaluate(()=>localStorage.clear()); await p.goto(FILE); await p.click('#start');
    for(let i=0;i<300;i++){
      const sc = await p.evaluate(()=>window.__mfm.st.scene);
      if(await p.$('#again')){ if(sc==='endw' || !(await p.$('#next'))) break; await p.click('#next'); continue; }
      if(await p.$('#c-end')){ await p.click('#c-end'); continue; }
      const k = await p.evaluate(([pol,death])=>{
        const M=window.__mfm, st=M.st, sc=M.SC[st.scene];
        const cs = typeof sc.choices==='function'? sc.choices(): sc.choices;
        const ok = cs.map((c,i)=>({c,i})).filter(o=>!o.c.lock && !death.includes(o.c.set));
        const hx = M.HX[st.scene];
        if(pol==='history'){ const h = hx && ok.find(o=>hx.h.includes(o.c.set)); return (h || ok.find(o=>!o.c.grown) || ok[0]).i; }
        const w = o => ((M.ECHO[o.c.set]||{}).w||{});
        return ok.slice().sort((a,b)=>(w(b)[pol]||0)-(w(a)[pol]||0))[0].i;
      }, [pol, DEATH]);
      await p.click(`.choice[data-i="${k}"]`);
    }
    const r = await p.evaluate(()=>{
      const M = window.__mfm, st = M.st, w = st.world;
      if(!w) return {err:'no world at '+st.scene};
      const d = M.decodeWorld(w.code);
      const ax = ['voice','hand','clean','ladder'].map(k=>Math.max(0,Math.min(31,M.ax(k))));
      const has = f => st.facts.includes(f);
      const bits = M.WFACTS.map(([ks])=>ks.some(has)?1:0);
      const dims = M.worldStart(w.t, st.facts);
      const checks = {
        decodes: d.ok,
        type: d.type===w.t && d.sub===w.s,
        ax: JSON.stringify([d.ax.voice,d.ax.hand,d.ax.clean,d.ax.ladder])===JSON.stringify(ax),
        dims: JSON.stringify(d.dimsRaw)===JSON.stringify(dims),
        facts: JSON.stringify(d.bits)===JSON.stringify(bits),
        people: JSON.stringify(d.peopleRaw)===JSON.stringify(w.people),
        lower: M.decodeWorld(w.code.toLowerCase().replace(/-/g,'')).ok
      };
      // 改错一个字：每一位都换成别的字，校验位都要能发现
      const A = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; let caught = 0, tried = 0;
      const raw = w.code.replace(/-/g,'');
      for(let i=4;i<raw.length;i++){ const c = raw[i]; const n = A[(A.indexOf(c)+7)%32]; const bad = raw.slice(0,i)+n+raw.slice(i+1); tried++; if(!M.decodeWorld(bad).ok) caught++; }
      checks.typo = caught===tried;
      return {code:w.code, scene:st.scene, typeName:d.typeName, checks, facts:d.facts.map(f=>f.label)};
    });
    if(r.err){ console.log(pol, r.err); fails++; continue; }
    const bad = Object.entries(r.checks).filter(([,v])=>!v).map(([k])=>k);
    if(bad.length) fails++;
    console.log(pol.padEnd(8), r.code, r.typeName, bad.length ? 'FAIL '+bad.join(',') : 'ok', '\n         ', r.facts.join('；'));
  }
  const ex = await p.evaluate(()=>['MFM1-H1-055Z-13521B5-0000G02J-BMNTJ-V','MFM1-W1-341Z-30S04A0-000SG02G-7ANTP-Z','MFM1-G1-FT7J-13521B5-7R7WYR01-BMNAP-W','MFM1-H1-055Z-13521B5-0000G02J-BMNTJ-W'].map(c=>window.__mfm.decodeWorld(c).ok));
  console.log('doc examples decode', ex, '(the last one has a wrong check char and should be false)');
  if(JSON.stringify(ex)!=='[true,true,true,false]') fails++;
  console.log('errors', errs, 'fails', fails);
  await b.close(); process.exit(fails||errs.length ? 1 : 0);
})();
