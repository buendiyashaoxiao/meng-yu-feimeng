// 上一步：走几步，退回去，检查场景和事实回到原样；在结局页也能退回去。
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const FILE = 'file://' + require('path').resolve(__dirname, '..', '梦与非梦.html');
(async()=>{ const b=await chromium.launch(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {}); const p=await b.newPage(); await p.route(/fonts\./,r=>r.abort());
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto(FILE); await p.evaluate(()=>localStorage.clear()); await p.goto(FILE); await p.click('#start');
const S=()=>p.evaluate(()=>({s:window.__mfm.st.scene, f:window.__mfm.st.facts.join(','), ax:window.__mfm.ax('ladder')}));
const trail=[await S()];
for(let i=0;i<6;i++){ await p.click('.choice[data-i="0"]'); trail.push(await S()); }
console.log('forward', trail.map(x=>x.s).join(' > '));
let ok=true;
for(let i=5;i>=2;i--){ await p.click('#t-undo'); const now=await S(); const want=trail[i]; if(now.s!==want.s||now.f!==want.f||now.ax!==want.ax){ ok=false; console.log('MISMATCH',i,now,want);} }
console.log('undo ok', ok);
// 退到底以后再往前走，换一个选项
await p.click('.choice[data-i]'); console.log('after redo', (await S()).s);
// 结局页：选死局，再退回
await p.goto(FILE); await p.evaluate(()=>localStorage.clear()); await p.goto(FILE); await p.click('#start');
for(const k of ['那天晚上','你以为','那天晚上你没睡着','十一月初','摆一摆','去北京','劝大家别拦车','拿他们当人质']){ for(const x of await p.$$('.choice[data-i]')) if((await x.textContent()).includes(k)){ await x.click(); break; } }
await p.click('#c-end'); console.log('end page', (await S()).s, 'has undo', !!(await p.$('#t-undo')));
await p.click('#t-undo'); console.log('back to', (await S()).s); await p.click('#t-undo'); console.log('back to', (await S()).s);
await p.reload(); console.log('after reload undo still', !!(await p.$('#t-undo')) || 'title');
console.log('errors', errs); await b.close(); })();
