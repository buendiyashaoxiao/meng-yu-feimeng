const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const FILE = 'file://' + require('path').resolve(__dirname, '..', '梦与非梦.html');
const a1 = ['那天晚上','你以为','那天晚上你没睡着','十一月初'];
const pre2 = ['半夜里','抽烟','带上十七厂','念一条宪法','抄在黑板上','#next','该说话','穿过人墙','第八十七条','靠着墙','先别冲','华山医院','签之前','让他们去北京','马天水的车','帽子','加一条','大楼不急','公社委员由工厂选','只守住','十二天以后'];
const toChange = [...a1,'不要司令','曹荻秋不来','走下去','下车',...pre2];
const histA3 = [...a1,'摆一摆','去北京','第一个走下去','留在座位','半夜里','拥护你的意见','带上十七厂','走上台','你们不听','#next','该说话','进楼','带头喊','靠着墙','跟耿金章去','开上午的会','在通令上签名','派人去','继续往北','照着稿子念','照原样签名','等张春桥','各家先报名单','天亮前','十二天以后','我同意','@end','#next','交给你办','站起来宣布','八月三日','今晚就在人民广场','把弹弓扔下楼','跑下楼','你站着','把东西退回去','给北京打了一个','一年以后','@end','#next'];
const routes = {
  ca_army:[...toChange,'不改。','@end','#next','把参谋那句话','请部队进厂'],
  ca_vote:[...toChange,'不改。','@end','#next','召集各厂','按规矩来'],
  ca_split:[...toChange,'不改。','@end','#next','去十七厂','打死人的交公安局'],
  cr:[...toChange,'赤卫队的工人留位置','@end','#next','我跟你一起'],
  cg_stamp:[...toChange,'登个记','@end','#next','盖章'],
  cg_deny:[...toChange,'登个记','@end','#next','不盖'],
  db:[...histA3,'你没有说话','会后你写了','去医院看周总理','你没有去长沙','把材料放下','车要开'],
  da:[...histA3,'你没有说话','会后你写了','去张春桥','风庆轮的事','在宪法草案','钉在钓鱼台'],
  ea:[...histA3,'主席让我读这个','你把选票塞进票箱，手很稳','去医院看周总理','北京现在大有','可以批判，允许','照着要点讲','一九七六年一月','@end','#next','加紧生产','你没有打电话'],
  ec:[...histA3,'主席让我读这个','你把选票塞进票箱，手很稳','去江青那里','北京现在大有','可以批判，允许','照着要点讲','一九七六年一月','@end','#next','加紧生产','加强战备','天亮以后','设。','叫值班室','开全会。'],
  starve:[...histA3,'主席让我读这个','你把选票塞进票箱，手很稳','去医院看周总理','北京现在大有','可以批判，允许','照着要点讲','一九七六年一月','@end','#next','加紧生产','加强战备','天亮以后','设。','拿上文件包','@end','#next','照着材料','你把笔放下'],
};
async function pick(page,key){
  if(key!=='#next' && await page.evaluate(()=>String(window.__mfm.st.scene).startsWith('x_'))){ await page.click('.choice[data-i]'); return pick(page,key); }
  if(key==='#next') return page.click('#next');
  if(key==='@end'){ if(await page.$('#c-end')) return page.click('#c-end'); const h=await page.$eval('h2',h=>h.textContent); if(['吸收','两参一改三结合','公报','四十三亿美元','艺徒','临时工','青海','全红总','郑州的名单','一根棍子','南京','专案组','学习班','广西来的人','工艺规程','以工代干','白卷','头上长角','前门和后门','一屋子材料','杭州','规章','七三开','三分'].includes(h)){ const bs=await page.$$('.choice[data-i]'); await bs[0].click(); await page.waitForTimeout(50); return pick(page,key);} throw new Error('no end at '+h); }
  const bs = await page.$$('.choice[data-i]');
  for(const b of bs){ if((await b.textContent()).includes(key)) return b.click(); }
  { const h=await page.$eval('h2',h=>h.textContent); if(['吸收','两参一改三结合','公报','四十三亿美元','艺徒','临时工','青海','全红总','郑州的名单','一根棍子','南京','专案组','学习班','广西来的人','工艺规程','以工代干','白卷','头上长角','前门和后门','一屋子材料','杭州','规章','七三开','三分'].includes(h)){ await bs[0].click(); await page.waitForTimeout(50); return pick(page,key); } }
  if(bs.length===1) return bs[0].click(); if(/弹弓|水箱/.test(key)) return;
  throw new Error('missing '+key+' at '+await page.$eval('h2',h=>h.textContent)+' | '+(await Promise.all(bs.map(b=>b.textContent()))).join(' / ').slice(0,300));
}
(async()=>{
  const browser = await chromium.launch((process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {}));
  const errs=[];
  for(const [name,steps] of Object.entries(routes).filter(([n])=>/^c[arg]/.test(n))){
    const ctx = await browser.newContext({viewport:{width:360,height:780}});
    const page = await ctx.newPage(); page.on('pageerror',e=>errs.push(name+': '+e.message));
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r=>r.abort());
    await page.goto(FILE); await page.evaluate(()=>localStorage.clear()); await page.goto(FILE); await page.click('#start');
    try{
      for(const s of steps) await pick(page,s);
      const trail=[];
      for(let k=0;k<60;k++){
        if(await page.$('#again')){ const n=await page.$('#next'); if(n){ trail.push('|'); await n.click(); continue;} break; }
        const h = await page.$eval('h2',h=>h.textContent); trail.push(h);
        const cs = await page.$$('.choice[data-i], #c-end'); await cs[cs.length-1].click();
      }
      const t = await page.$eval('h2',h=>h.textContent);
      const ow = await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
      console.log(name.padEnd(9),'→',t,'| ow',ow,'|',trail.join(' > '));
    }catch(e){ console.log(name,'FAIL',e.message); }
    await ctx.close();
  }
  console.log('errors',errs); await browser.close();
})();
