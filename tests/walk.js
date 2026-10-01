const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path');
const FILE = 'file://' + path.resolve(__dirname, '..', '梦与非梦.html');
const N = +process.argv[2] || 60;
(async () => {
  const browser = await chromium.launch((process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {})).catch(()=>chromium.launch());
  const errors = [];
  const endings = {}; const scenes = new Set(); let overflow = [];
  for (const scheme of ['light','dark']) {
    const ctx = await browser.newContext({viewport:{width:360,height:780}, colorScheme: scheme});
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push('pageerror: '+e.message));
    page.on('console', m => { if (m.type()==='error' && !/fonts|ERR_|net::/.test(m.text())) errors.push('console: '+m.text()); });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    for (let w=0; w<N/2; w++) {
      await page.goto(FILE);
      await page.evaluate(()=>localStorage.clear());
      await page.goto(FILE);
      await page.click('#start');
      const trail = []; let redoUsed=0;
      for (let step=0; step<160; step++) {
        const sc = await page.evaluate(()=>document.querySelector('h2')?.textContent);
        scenes.add(sc);
        const ow = await page.evaluate(()=>document.documentElement.scrollWidth - window.innerWidth);
        if (ow>0) overflow.push(sc+':'+ow);
        // poke toolbar sometimes
        if (Math.random()<0.08) { const b = await page.$('#t-arch'); if (b){ await b.click(); const y=await page.$('#y77'); if(y) await y.click(); } }
        if (Math.random()<0.05) { const b = await page.$("#t-src"); if (b) await b.click(); }
        if (Math.random()<0.05) { const g = await page.$('.story .g'); if (g) { await g.click(); await page.keyboard.press('Escape'); } }
        const endBtn = await page.$('#again');
        if (endBtn) {
          for (const k of ['xu','li','rel','hist','huang']) await page.click('#lens-'+k);
          const title = await page.evaluate(()=>document.querySelector('h2').textContent);
          const nxt = await page.$('#next');
          const rd = await page.$('#redo'); if (rd && redoUsed<2 && Math.random()<0.4) { redoUsed++; trail.push('REDO'); await rd.click(); console.log('redo ->', await page.evaluate(()=>document.querySelector('h2').textContent)); continue; }
          if (nxt && Math.random()<0.85) { trail.push('NEXT'); await nxt.click(); continue; }
          endings[title] = (endings[title]||0)+1; console.log('walk', scheme, w, title, errors.length);
          break;
        }
        const opts = await page.$$('.choice[data-i], #c-end');
        if (!opts.length) { errors.push('stuck at '+sc+' trail '+trail.join(',')); break; }
        const i = Math.floor(Math.random()*opts.length);
        trail.push(sc+'#'+i);
        await opts[i].click();
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log('scenes', [...scenes].join(' | '));
  console.log('endings', endings);
  console.log('overflow', [...new Set(overflow)]);
  console.log('errors', [...new Set(errors)]);
})();
