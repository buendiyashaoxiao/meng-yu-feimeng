// 随机走很多局（包括提前结束的选项），收集每一种停下来的页面，检查最上面有没有结局总结（.ending）。
// 用法：node tests/endings.js [局数] [每一步选死局的概率，默认 0.1]
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const FILE = 'file://' + require('path').resolve(__dirname, '..', '梦与非梦.html');
const N = +process.argv[2] || 60;
(async()=>{
  const b = await chromium.launch(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {});
  const p = await b.newPage({viewport:{width:390,height:844}}); await p.route(/fonts\./, r=>r.abort());
  const errs = []; p.on('pageerror', e=>errs.push(e.message));
  const seen = {};
  for(let r=0;r<N;r++){
    await p.goto(FILE); await p.evaluate(()=>localStorage.clear()); await p.goto(FILE); await p.click('#start');
    const deathBias = +(process.argv[3]||0.1);
    let path=[];
    for(let i=0;i<400;i++){
      const sc = await p.evaluate(()=>window.__mfm.st.scene); path.push(sc);
      if(await p.$('#again')){
        const nx = await p.$('#next');
        if(nx && (sc!=='endw')){ await nx.click(); continue; }
        const info = await p.evaluate(()=>({scene:window.__mfm.st.scene, h2:(document.querySelector('h2')||{}).textContent, cause:!!document.querySelector('.cause'), ending:!!document.querySelector('.ending'), world:!!document.querySelector('.world'), after:!!document.querySelector('.after'), text:(document.querySelector('.story')||{innerText:''}).innerText.slice(0,60)}));
        const prev = path[path.length-2]; const key = info.scene+' ← '+prev;
        if(!seen[key]) seen[key] = {...info, prev, n:0}; seen[key].n++;
        break;
      }
      if(await p.$('#c-end')){ await p.click('#c-end'); continue; }
      const i2 = await p.evaluate(bias=>{ const M=window.__mfm, st=M.st, sc=M.SC[st.scene]; const cs=(typeof sc.choices==='function'?sc.choices():sc.choices)||[]; const ok=cs.map((c,i)=>({c,i})).filter(o=>!o.c.lock); if(!ok.length) return -1;
        const d = ok.filter(o=>M.SC[o.c.next] && M.SC[o.c.next].death); if(d.length && Math.random()<bias) return d[0].i;
        const nd = ok.filter(o=>!(M.SC[o.c.next] && M.SC[o.c.next].death)); const pool = nd.length ? nd : ok; return pool[Math.floor(Math.random()*pool.length)].i; }, deathBias);
      if(i2<0){ const info={scene:sc, h2:'(无选项，卡住)'}; seen['STUCK '+sc]=info; break; }
      await p.click(`.choice[data-i="${i2}"]`);
    }
  }
  for(const [k,v] of Object.entries(seen)) console.log((v.ending?'OK  ':'MISS')+' '+k+' | '+v.h2+' | ending '+v.ending+' cause '+v.cause+' world '+v.world+' after '+v.after+' | x'+v.n+' | '+(v.text||'').replace(/\n/g,' '));
  console.log('errors', [...new Set(errs)]);
  await b.close();
})();
