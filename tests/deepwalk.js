// 随机走 N 局，但不选提前结束的选项，尽量走到一九七八年十二月；统计到达的场景、世界线主型、报错和横向溢出，并检查每一串代码能解回来。
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const FILE = 'file://' + require('path').resolve(__dirname, '..', '梦与非梦.html');
const N = +process.argv[2] || 20;
const DEATH = ['harsh','add_name','go_ks','seize_alone','bunker','ll_dinner','cs_worst','call_sh','jb_false','go_home','k1_arm','k2_fight','hard'];
(async()=>{
  const b = await chromium.launch(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {});
  const errs = [], scenes = {}, worlds = {}, over = new Set();
  for(const scheme of ['light','dark']){
    const ctx = await b.newContext({viewport:{width:360,height:780}, colorScheme:scheme});
    const p = await ctx.newPage(); p.on('pageerror', e=>errs.push(e.message)); await p.route(/fonts\./, r=>r.abort());
    for(let w=0; w<N/2; w++){
      await p.goto(FILE); await p.evaluate(()=>localStorage.clear()); await p.goto(FILE); await p.click('#start');
      for(let i=0;i<300;i++){
        const sc = await p.evaluate(()=>window.__mfm.st.scene); scenes[sc] = (scenes[sc]||0)+1;
        const ow = await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth); if(ow>0) over.add(sc+':'+ow);
        if(Math.random()<0.1){ for(const id of ['#t-src','#t-ctx','#t-dr','#t-arch']){ const x = await p.$(id); if(x) await x.click(); } }
        if(await p.$('#again')){
          if(sc==='endw' || !(await p.$('#next'))){
            const r = await p.evaluate(()=>{ const M=window.__mfm, w=M.st.world; return w ? {code:w.code, ok:M.decodeWorld(w.code).ok, t:w.t+w.s} : null; });
            if(!r) errs.push('no world at '+sc); else { worlds[r.t]=(worlds[r.t]||0)+1; if(!r.ok) errs.push('decode fail '+r.code); }
            break;
          }
          await p.click('#next'); continue;
        }
        if(await p.$('#c-end')){ await p.click('#c-end'); continue; }
        const i2 = await p.evaluate(death=>{ const M=window.__mfm, st=M.st, sc=M.SC[st.scene]; const cs = typeof sc.choices==='function'?sc.choices():sc.choices; const ok = cs.map((c,i)=>({c,i})).filter(o=>!o.c.lock && !death.includes(o.c.set)); const pool = ok.length?ok:cs.map((c,i)=>({c,i})).filter(o=>!o.c.lock); return pool[Math.floor(Math.random()*pool.length)].i; }, DEATH);
        await p.click(`.choice[data-i="${i2}"]`);
      }
    }
    await ctx.close();
  }
  await b.close();
  console.log('worlds', worlds);
  console.log('new scenes', Object.keys(scenes).filter(k=>/^(p3f|b10t|b14q|b14t|c5[mnqbg]|c6[bc]|d1b|d2[xyz]|d3z|db[23]|d6[xy]|k7[ab]|z_)/.test(k)).map(k=>k+':'+scenes[k]).join(' '));
  console.log('overflow', [...over]); console.log('errors', [...new Set(errs)]);
})();
