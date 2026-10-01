const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const FILE='file://' + require('path').resolve(__dirname, '..', '梦与非梦.html');
const DEATH=['harsh','add_name','go_ks','seize_alone','bunker','ll_dinner','cs_worst','call_sh','jb_false','go_home','k1_arm','k2_fight','hard'];
async function play(p, want){ // want: array of set flags to prefer when available
  const trail=[];
  for(let i=0;i<120;i++){
    if(await p.$('#again')){ const n=await p.$('#next'); if(n){ trail.push('|'); await n.click(); continue;} break; }
    if(await p.$('#c-end')){ await p.click('#c-end'); continue; }
    const pick=await p.evaluate(([want,death])=>{ const M=window.__mfm, st=M.st, sc=M.SC[st.scene]; const cs=typeof sc.choices==='function'?sc.choices():sc.choices;
      let i=cs.findIndex(c=>want.includes(c.set)); if(i<0) i=cs.findIndex(c=>!death.includes(c.set)&&!c.lock&&!c.grown); if(i<0) i=0; return i; },[want,DEATH]);
    trail.push(await p.$eval('h2',h=>h.textContent));
    await p.click(`.choice[data-i="${pick}"]`);
  }
  return trail;
}
(async()=>{
  const b=await chromium.launch((process.env.CHROME_PATH ? {executablePath: process.env.CHROME_PATH} : {}));
  const errs=[];
  const mk=async()=>{ const p=await b.newPage({viewport:{width:360,height:780}}); p.on('pageerror',e=>errs.push(e.message)); await p.route(/fonts\./,r=>r.abort()); await p.goto(FILE); await p.evaluate(()=>localStorage.clear()); await p.goto(FILE); await p.click('#start'); return p; };
  // 1. character card + ctx: play history to b11 (大楼) then open 周月娥 / 陆根宝 / 范师傅
  let p=await mk();
  for(let i=0;i<60;i++){
    const sc=await p.evaluate(()=>window.__mfm.st.scene); if(sc==='b11') break;
    if(await p.$('#again')){ await p.click('#next'); continue; }
    if(await p.$('#c-end')){ await p.click('#c-end'); continue; }
    if(sc==='b5'){ await p.click('#t-ctx'); const t=await p.$eval('.panel.ctx',x=>x.textContent.slice(0,60)); console.log('ctx b5:',t); }
    const want=['dissent','swallowed','kp_talk','add_temp','talk_cwd','shout_bh'];
    const pick=await p.evaluate(([want,death])=>{ const M=window.__mfm, st=M.st, sc=M.SC[st.scene]; const cs=typeof sc.choices==='function'?sc.choices():sc.choices;
      let i=cs.findIndex(c=>want.includes(c.set)); if(i<0) i=cs.findIndex(c=>!death.includes(c.set)&&!c.grown); return Math.max(i,0); },[want,DEATH]);
    await p.click(`.choice[data-i="${pick}"]`);
  }
  for(const nm of ['周月娥','范师傅','陆根宝']){
    await p.evaluate(nm=>{ const s=document.createElement('button'); s.className='g'; s.dataset.g={周月娥:'zye',范师傅:'fsf',陆根宝:'lgb'}[nm]; s.id='tmpg'; s.textContent='x'; document.getElementById('app').prepend(s); },nm);
    await p.click('#tmpg'); const t=await p.$eval('#sheet .sheet-body',x=>x.innerText); console.log('== card',nm,'\n',t.replace(/\n+/g,' / ').slice(0,400)); await p.evaluate(()=>{document.getElementById('tmpg').remove(); document.getElementById('sheet').hidden=true;});
  }
  await p.close();
  // 2. IF lines k3, k6, da, k4 via injected facts
  const routes = {
    k3:{facts:['go_zel'], at:'d2', want:['go_zel','cs_skip','b2_coop']},
    da:{facts:['cite_const','elect','lead_col','lyz_debate'], at:'d4', want:['a4_clause','da_pin']},
    k4:{facts:['a6_propose'], at:'e1', want:['sw_go','ea_speak']},
    k6:{facts:['duty_room','go_jq','smash','sign_order','block_hg','geng_huang','fan_arrest','ls_smash','cs_lushan','mil_up','deal','on_stage'], at:'e4', want:['c1_move','ec_plenum']},
  };
  for(const [name,r] of Object.entries(routes)){
    p=await mk();
    await p.evaluate(r=>{ const st=window.__mfm.st; st.facts=r.facts.slice(); st.scene=r.at; st.act=window.__mfm.SC[r.at].act; st.path=[r.at]; },r);
    await p.click('#t-gl'); await p.click('#t-gl');
    const tr=await play(p, r.want);
    const end=await p.$eval('h2',h=>h.textContent);
    const redo=await p.$$eval('[data-redo]',x=>x.map(y=>y.innerText.replace(/\n/g,' ')));
    console.log(name,'→',end,'| redo:',redo.join(', '),'\n   ',tr.join(' > '));
    if(name==='k6'){ const g0=await p.evaluate(()=>window.__mfm.st.path.includes('g0')); console.log('   g0 visited',g0); }
    if(redo.length){ await p.click('[data-redo]'); console.log('   after redo →', await p.$eval('h2',h=>h.textContent)); }
    await p.close();
  }
  console.log('errors',errs); await b.close();
})();
