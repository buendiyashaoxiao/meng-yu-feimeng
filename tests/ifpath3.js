const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const FILE = 'file://' + require('path').resolve(__dirname, '..', '梦与非梦.html');
const OUT = require('os').tmpdir() + '/';
const base = ['那天晚上','你以为','那天晚上你没睡着','十一月初','不要司令','去北京','走下去','下车','半夜里','抽烟','留下来，跟黄金海','念一条宪法','抄在黑板上','#next','该说话','穿过人墙','第八十七条','靠着墙','先别冲','华山医院','签之前','让他们去北京','马天水的车','帽子','加一条','大楼不急','公社委员由工厂选','只守住','十二天以后'];
async function pick(page, key){
  if(key==='#next'){ await page.click('#next'); return; }
  if(key==='@醒来'){ await page.click('#c-end'); return; }
  const btns = await page.$$('.choice[data-i]');
  for(const b of btns){ const t = await b.textContent(); if(t.includes(key)){ await b.click(); return; } }
  { const h0=await page.evaluate(()=>document.querySelector('h2').textContent); if(['吸收','两参一改三结合','公报','四十三亿美元','艺徒','临时工','青海','全红总','郑州的名单','一根棍子','南京','专案组','学习班','广西来的人','工艺规程','以工代干','白卷','头上长角','前门和后门','一屋子材料','杭州','规章','七三开','三分'].includes(h0)){ await btns[0].click(); await page.waitForTimeout(50); return pick(page,key);} }
  if(btns.length===1) return btns[0].click(); if(/弹弓|水箱/.test(key)) return;
  const h = await page.evaluate(()=>document.querySelector('h2').textContent);
  throw new Error('no choice '+key+' at '+h+' options: '+(await Promise.all(btns.map(b=>b.textContent()))).join(' / '));
}
(async()=>{
  const browser = await chromium.launch((process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {}));
  const errs=[];
  for(const [final,scheme] of [['不改','light'],['赤卫队的工人留位置','dark'],['登个记','light']]){
    const ctx = await browser.newContext({viewport:{width:375,height:800}, colorScheme:scheme});
    const page = await ctx.newPage();
    page.on('pageerror',e=>errs.push(e.message));
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r=>r.abort());
    await page.goto(FILE); await page.evaluate(()=>localStorage.clear()); await page.goto(FILE);
    await page.click('#start');
    for(const k of base){
      await pick(page,k);
      const h = await page.evaluate(()=>document.querySelector('h2').textContent);
      if(final==='不改' && ['剥开画皮看真相','康平路','签字','改名'].includes(h)) await page.screenshot({path:OUT+'s_'+h+'.png', fullPage:true});
    }
    const grown = await page.$$eval('.choice.grown', b=>b.map(x=>x.textContent.slice(10,30)));
    console.log(final, 'grown at 改名:', grown);
    await pick(page, final);
    const h = await page.evaluate(()=>document.querySelector('h2').textContent);
    await page.click('#c-end');
    // continue into act 3 IF arc
    await page.click('#next');
    for(let k=0;k<12;k++){
      if(await page.$('#again')) break;
      const c = await page.$('.choice[data-i], #c-end'); await c.click();
    }
    await page.click('#t-arch'); await page.click('#y77');
    const title = await page.evaluate(()=>document.querySelector('h2').textContent);
    const ow = await page.evaluate(()=>document.documentElement.scrollWidth - innerWidth);
    await page.screenshot({path:OUT+'end_'+scheme+'_'+title+'.png', fullPage:true});
    console.log('→', h, '→', title, 'overflow', ow, 'next?', !!(await page.$('#next')));
    await ctx.close();
  }
  console.log('errors', errs);
  await browser.close();
})().catch(e=>{console.error(e.message);process.exit(1)});
