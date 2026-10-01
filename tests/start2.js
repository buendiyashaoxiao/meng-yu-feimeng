const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const FILE='file://' + require('path').resolve(__dirname, '..', '梦与非梦.html');
(async()=>{
  const b=await chromium.launch((process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {}));
  const errs=[]; const p=await b.newPage({viewport:{width:360,height:780}}); p.on('pageerror',e=>errs.push(e.message)); await p.route(/fonts\./,r=>r.abort());
  await p.goto(FILE); await p.evaluate(()=>localStorage.clear()); await p.goto(FILE);
  await p.click('#pick-act'); await p.click('[data-act="5"]');
  console.log((await p.$eval('.startp',x=>x.innerText)).replace(/\n+/g,' / ').slice(0,600));
  await p.screenshot({path:'preset.png',fullPage:true});
  await p.click('[data-preset="hand"]'); console.log('start →', await p.$eval('h2',x=>x.textContent));
  // play to end of act 5 picking first non-grown options
  for(let i=0;i<40;i++){ if(await p.$('#again')) break; if(await p.$('#c-end')){ await p.click('#c-end'); continue; }
    const i0=await p.evaluate(()=>{ const M=window.__mfm, st=M.st, sc=M.SC[st.scene]; const cs=typeof sc.choices==='function'?sc.choices():sc.choices; const bad=['call_sh','c1_move','sw_go']; const i=cs.findIndex(c=>!bad.includes(c.set)&&!c.grown); return Math.max(i,0); });
    await p.click(`.choice[data-i="${i0}"]`); }
  console.log('end screen:', await p.$eval('h2',x=>x.textContent));
  console.log((await p.$eval('.redo-rows',x=>x.innerText)).replace(/\n+/g,' / '));
  await p.click('[data-repick="5"]'); await p.click('#repick-box [data-preset="voice"]');
  console.log('repick →', await p.$eval('h2',x=>x.textContent), await p.evaluate(()=>['voice','hand','clean','ladder'].map(k=>window.__mfm.ax(k))));
  const ow=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth); console.log('overflow',ow,'errors',errs);
  await b.close();
})();
