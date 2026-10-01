const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const FILE='file://' + require('path').resolve(__dirname, '..', '梦与非梦.html');
const DEATH = new Set(['harsh','add_name','go_ks','seize_alone','bunker','ll_dinner','cs_worst','call_sh','jb_false','go_home','k1_arm','k2_fight','hard']);
(async()=>{
  const b=await chromium.launch((process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {}));
  const errs=[];
  for(const pol of ['history','gentle','voice','clean']){
    const p=await b.newPage({viewport:{width:360,height:780}}); p.on('pageerror',e=>errs.push(pol+': '+e.message));
    await p.route(/fonts\./,r=>r.abort());
    await p.goto(FILE); await p.evaluate(()=>localStorage.clear()); await p.goto(FILE); await p.click('#start');
    const trail=[]; let echoes=0, doors=[];
    for(let i=0;i<200;i++){
      const h=await p.$eval('h2',x=>x.textContent);
      if(await p.$('.echo')) echoes++;
      for(const d of await p.$$eval('.e-door',x=>x.map(y=>y.textContent))) doors.push(h+': '+d.slice(0,40));
      const ow=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth); if(ow>0) errs.push(pol+' overflow '+h+' '+ow);
      if(await p.$('#again')){ const n=await p.$('#next'); if(n){ trail.push('|'); await n.click(); continue;} break; }
      if(await p.$('#c-end')){ await p.click('#c-end'); continue; }
      const pick = await p.evaluate(([pol,death])=>{
        const M=window.__mfm, st=M.st, sc=M.SC[st.scene];
        const cs = typeof sc.choices==='function'? sc.choices(): sc.choices;
        const ok = cs.map((c,i)=>({c,i})).filter(o=>!o.c.lock && !death.includes(o.c.set));
        const hx = M.HX[st.scene];
        if(pol==='history'){ const h = hx && ok.find(o=>hx.h.includes(o.c.set)); const o = h || ok.find(o=>!o.c.grown) || ok[0]; return o.i; }
        const key = {gentle:'hand',voice:'voice',clean:'clean'}[pol];
        const w = o => ((M.ECHO[o.c.set]||{}).w||{});
        let best = ok.filter(o=> pol==='voice' ? true : !o.c.grown);
        if(!best.length) best = ok;
        best.sort((a,b)=>((w(b)[key]||0)-(w(a)[key]||0)) || ((w(a).ladder||0)-(w(b).ladder||0)));
        return best[0].i;
      }, [pol,[...DEATH]]);
      trail.push(h);
      await p.click(`.choice[data-i="${pick}"]`);
    }
    const st = await p.evaluate(()=>({ax:['voice','hand','clean','ladder'].map(k=>window.__mfm.ax(k)), branch:window.__mfm.st.branch, end:document.querySelector('h2').textContent}));
    await p.click('#t-dr'); const dr = await p.$eval('.drift .dr-sum',x=>x.textContent);
    console.log(pol, JSON.stringify(st), 'echoes', echoes, '\n  ', dr, '\n   doors', doors, '\n   ', trail.join(' > '));
    await p.screenshot({path:'pol_'+pol+'.png'});
    await p.close();
  }
  console.log('errors', errs); await b.close();
})();
