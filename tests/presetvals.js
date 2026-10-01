const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
(async()=>{ const b=await chromium.launch((process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {})); const p=await b.newPage(); await p.route(/fonts\./,r=>r.abort());
 p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('file://' + require('path').resolve(__dirname, '..', '梦与非梦.html'));
 for(const act of [3,4,5,6]) for(const pk of ['hist','ladder','hand','voice','clean']){
  const r=await p.evaluate(([pk,act])=>{ const M=window.__mfm; const ok=M.sim(pk,act); const st=M.st; return {ok,scene:st.scene,branch:st.branch,bj:st.path.includes('c10'),ax:['voice','hand','clean','ladder'].map(k=>M.ax(k))}; },[pk,act]);
  console.log(act,pk.padEnd(6),JSON.stringify(r));
 }
 await b.close(); })();
