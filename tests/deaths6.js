const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const FILE = 'file://' + require('path').resolve(__dirname, '..', '梦与非梦.html');
const OUT = require('os').tmpdir() + '/';
const pre = ['那天晚上','你以为','那天晚上你没睡着','十一月初','摆一摆','去北京','第一个走下去','留在座位','半夜里','拥护你的意见','带上十七厂','走上台','你们不听','#next','该说话','进楼','带头喊','靠着墙','跟耿金章去','开上午的会'];
async function pick(page,key){
  if(key==='#next') return page.click('#next');
  if(key==='@end'){ if(await page.$('#c-end')) return page.click('#c-end'); const h=await page.$eval('h2',h=>h.textContent); if(['吸收','两参一改三结合','公报','四十三亿美元'].includes(h)){ const bs=await page.$$('.choice[data-i]'); await bs[0].click(); await page.waitForTimeout(50); return pick(page,key);} throw new Error('no end at '+h); }
  const bs = await page.$$('.choice[data-i]');
  for(const b of bs){ if((await b.textContent()).includes(key)) return b.click(); }
  if(bs.length===1) return bs[0].click(); if(/弹弓|水箱/.test(key)) return;
  { const h=await page.$eval('h2',h=>h.textContent); if(['吸收','两参一改三结合','公报','四十三亿美元'].includes(h)){ await bs[0].click(); await page.waitForTimeout(50); return pick(page,key); } }
  throw new Error('missing '+key+' at '+await page.$eval('h2',h=>h.textContent));
}
(async()=>{
  const browser = await chromium.launch((process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {}));
  const errs=[];
  const routes = {
    list: [...pre,'补上钱师傅','@end'],
    ks: [...pre,'在通令上签名','亲自带人去','@end'],
    seize: [...pre,'在通令上签名','派人去','继续往北','照着稿子念','照原样签名','今天夜里就带人','@end'],
    hist: [...pre,'在通令上签名','派人去','继续往北','照着稿子念','照原样签名','等张春桥','各家先报名单','天亮前','十二天以后','我同意','@end'],
    a6: [...pre,'在通令上签名','派人去','继续往北','照着稿子念','照原样签名','等张春桥','各家先报名单','天亮前','十二天以后','我同意','@end','#next','交给你办','站起来宣布','八月三日','今晚就在人民广场','把弹弓扔下楼','跑下楼','你站着','把东西退回去','给北京打了一个','一年以后','@end','#next','主席让我读这个','主席的选票','去医院看周总理','北京现在大有','可以批判，允许','照着要点讲','一九七六年一月','@end','#next','加紧生产','加强战备','天亮以后','设。','拿上文件包','@end','#next','这些东西，有的拿了','黄金海跟我在一起','我认为起诉书','那年十月一日','明年还来','一九九二年八月','@end','#next','你去搜了','@end'],
    a6false: [...pre,'在通令上签名','派人去','继续往北','照着稿子念','照原样签名','等张春桥','各家先报名单','天亮前','十二天以后','我同意','@end','#next','交给你办','站起来宣布','八月三日','今晚就在人民广场','把弹弓扔下楼','跑下楼','你站着','把东西退回去','给北京打了一个','一年以后','@end','#next','主席让我读这个','主席的选票','去医院看周总理','北京现在大有','可以批判，允许','照着要点讲','一九七六年一月','@end','#next','加紧生产','加强战备','天亮以后','设。','拿上文件包','@end','#next','照着材料','一个字也不写','@end'],
    a6true: [...pre,'在通令上签名','派人去','继续往北','照着稿子念','照原样签名','等张春桥','各家先报名单','天亮前','十二天以后','我同意','@end','#next','交给你办','站起来宣布','八月三日','今晚就在人民广场','把弹弓扔下楼','跑下楼','你站着','把东西退回去','给北京打了一个','一年以后','@end','#next','主席让我读这个','主席的选票','去医院看周总理','北京现在大有','可以批判，允许','照着要点讲','一九七六年一月','@end','#next','加紧生产','加强战备','天亮以后','设。','拿上文件包','@end','#next','这些东西，有的拿了','我记不清了','我认罪。可我要把','@end','#next','你转发了','@end'],
    a5: [...pre,'在通令上签名','派人去','继续往北','照着稿子念','照原样签名','等张春桥','各家先报名单','天亮前','十二天以后','我同意','@end','#next','交给你办','站起来宣布','八月三日','今晚就在人民广场','把弹弓扔下楼','跑下楼','你站着','把东西退回去','给北京打了一个','一年以后','@end','#next','主席让我读这个','主席的选票','去医院看周总理','北京现在大有','可以批判，允许','照着要点讲','一九七六年一月','@end','#next','加紧生产','加强战备','天亮以后','设。','拿上文件包','@end'],
    a5arms: [...pre,'在通令上签名','派人去','继续往北','照着稿子念','照原样签名','等张春桥','各家先报名单','天亮前','十二天以后','我同意','@end','#next','交给你办','站起来宣布','八月三日','今晚就在人民广场','把弹弓扔下楼','跑下楼','你站着','把东西退回去','给北京打了一个','一年以后','@end','#next','主席让我读这个','主席的选票','去医院看周总理','北京现在大有','可以批判，允许','照着要点讲','一九七六年一月','@end','#next','加紧生产','加强战备','天亮以后','这件事要政治局定','你没有下楼。你拿起电话','@end'],
    a5c1: [...pre,'在通令上签名','派人去','继续往北','照着稿子念','照原样签名','等张春桥','各家先报名单','天亮前','十二天以后','我同意','@end','#next','交给你办','站起来宣布','八月三日','今晚就在人民广场','把弹弓扔下楼','跑下楼','你站着','把东西退回去','给北京打了一个','一年以后','@end','#next','主席让我读这个','主席的选票','去江青那里','北京现在大有','可以批判，允许','照着要点讲','一九七六年一月','@end','#next','加紧生产','加强战备','天亮以后','设。','叫值班室','开全会。','@end'],
    a4: [...pre,'在通令上签名','派人去','继续往北','照着稿子念','照原样签名','等张春桥','各家先报名单','天亮前','十二天以后','我同意','@end','#next','交给你办','站起来宣布','八月三日','今晚就在人民广场','把弹弓扔下楼','跑下楼','你站着','把东西退回去','给北京打了一个','一年以后','@end','#next','主席让我读这个','主席的选票','去医院看周总理','北京现在大有','可以批判，允许','照着要点讲','一九七六年一月','@end'],
    a4exile: [...pre,'在通令上签名','派人去','继续往北','照着稿子念','照原样签名','等张春桥','各家先报名单','天亮前','十二天以后','我同意','@end','#next','交给你办','站起来宣布','八月三日','今晚就在人民广场','把弹弓扔下楼','跑下楼','你站着','把东西退回去','给北京打了一个','一年以后','@end','#next','刘盆子后来','回头看了一眼','去江青那里','第二个林彪','@end'],
    a4b2: [...pre,'在通令上签名','派人去','继续往北','照着稿子念','照原样签名','等张春桥','各家先报名单','天亮前','十二天以后','我同意','@end','#next','交给你办','站起来宣布','八月三日','今晚就在人民广场','把弹弓扔下楼','跑下楼','你站着','把东西退回去','给北京打了一个','一年以后','@end','#next','你没有说话','会后你写了','去医院看周总理','你没有去长沙','把材料放下','车要开','@end'],
    a4a4: [...pre,'在通令上签名','派人去','继续往北','照着稿子念','照原样签名','等张春桥','各家先报名单','天亮前','十二天以后','我同意','@end','#next','交给你办','站起来宣布','八月三日','今晚就在人民广场','把弹弓扔下楼','跑下楼','你站着','把东西退回去','给北京打了一个','一年以后','@end','#next','你没有说话','会后你写了','去张春桥','风庆轮的事','在宪法草案','钉在钓鱼台','@end'],
    a3bunker: [...pre,'在通令上签名','派人去','继续往北','照着稿子念','照原样签名','等张春桥','各家先报名单','天亮前','十二天以后','改名我同意','@end','#next','我给他打电话','把那张布告','八月三日','开什么会','攥在手里','一个也不许','@end'],
    a3lin: [...pre,'在通令上签名','派人去','继续往北','照着稿子念','照原样签名','等张春桥','各家先报名单','天亮前','十二天以后','我同意','@end','#next','先不抓','从明天起','八月三日','我先一个人','攥在手里','没有下楼','你站着','收下。你是','好，我去','@end'],
  };
  for(const [name,steps] of Object.entries(routes).filter(([n])=>n.startsWith('a6'))){
    const ctx = await browser.newContext({viewport:{width:360,height:780}, colorScheme: name==='ks'?'dark':'light'});
    const page = await ctx.newPage(); page.on('pageerror',e=>errs.push(e.message));
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r=>r.abort());
    await page.goto(FILE); await page.evaluate(()=>localStorage.clear()); await page.goto(FILE); await page.click('#start');
    for(const s of steps){ await pick(page,s); }
    const h = await page.$eval('h2',h=>h.textContent);
    const grown = await page.$$('.choice.grown');
    for (const k of ['xu','li','rel','hist']) await page.click('#lens-'+k);
    await page.waitForTimeout(700);
    const ow = await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    console.log(name,'→',h,'overflow',ow, 'next:', await page.$eval('#app',a=>a.innerText.includes('下一幕尚未制作')));
    if(name==='ks'){ await page.screenshot({path:OUT+'death_ks.png',fullPage:true}); }
    // resume test
    await page.goto(FILE);
    const resume = await page.$('#resume'); console.log('  resume button', !!resume, await page.$eval('#dreams',d=>d.textContent));
    if(resume){ await resume.click(); console.log('  resumed at', await page.$eval('h2',h=>h.textContent)); }
    await page.click('#theme'); await page.click('#theme');
    console.log('  theme attr', await page.evaluate(()=>document.documentElement.dataset.theme));
    await ctx.close();
  }
  // screenshot death verdict page ks before waking
  const ctx = await browser.newContext({viewport:{width:360,height:780}, colorScheme:'dark'});
  const page = await ctx.newPage(); await page.route(/fonts\.(googleapis|gstatic)\.com/, r=>r.abort());
  await page.goto(FILE); await page.evaluate(()=>localStorage.clear()); await page.goto(FILE); await page.click('#start');
  for(const s of [...pre,'在通令上签名','亲自带人去']) await pick(page,s);
  await page.waitForTimeout(900);
  console.log('verdict overflow', await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth));
  await page.screenshot({path:OUT+'verdict_ks.png',fullPage:true});
  console.log('errors',errs);
  await browser.close();
})().catch(e=>{console.error('FAIL',e.message);process.exit(1)});
