// 1.3 版的路线测试：按一串偏好的选项走到一九七八年十二月的结局页，打印路径、世界线代码和解码结果。
// 用法：CHROME_PATH=/opt/pw-browsers/chromium/chrome-linux/chrome node tests/routes13.js [路线名]
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const FILE = 'file://' + require('path').resolve(__dirname, '..', '梦与非梦.html');
const DEATH = ['harsh','add_name','go_ks','seize_alone','bunker','ll_dinner','cs_worst','call_sh','jb_false','go_home','k1_arm','k2_fight','hard'];
const ROUTES = {
  hist:   {prefs:[], hist:true},
  temp:   {prefs:['p0_join','talked','dissent','go_back','visit_hosp','kp_talk','talk_cwd','buffer','add_temp','tw_quota','qh_keep','tw_keep','protect','mil_unit','nj_both','qd_rules','xb_warn','gx_hide','ags_real','ags_mix','ags_tech','ags_ygdg','a6_refuse','tj_both','jd_files','jd_both','hm_list','fl_seal','zj_jail','k7_go','gh_ld','k7_note'], avoid:['no_rename','reconcile','register','cs_skip','b2_coop','a4_clause','sw_go','c1_move']},
  deng:   {prefs:['add_temp','tw_quota','tw_keep','ags_real','ags_tech','go_zel','cs_skip','b2_coop','db_soft','db_case','zd_dhd','jy_draft','jy_gx','jd_both','k3_share','k3_seen'], avoid:['no_rename','reconcile','register','k7_go','sw_go','a4_clause']},
  win:    {prefs:['deal','on_stage','smash','sign_order','seize_joint','block_hg','rename','geng_huang','fan_arrest','ls_smash','watch','mil_hq','nj_zcq','qd_quota','gx_send','ags_real','ags_tech','sh_open','imp_learn','tj_blank','jd_horn','fl_burn','zj_back','go_jq','cs_lushan','lyz_crush','sd_hist','mil_up','sw_hist','duty_room','c1_move','ec_purge'], hist:true, avoid:['k7_go','b2_coop','a4_clause','sw_go']},
  square: {prefs:['dissent','go_back','visit_hosp','kp_talk','talk_cwd','add_temp','protect','a6_refuse','a6_propose','lyz_debate','sw_go','ea_speak','k4_write'], avoid:['no_rename','reconcile','register','k7_go','b2_coop','a4_clause','cs_skip']},
  commune:{prefs:['cite_const','lead_col','elect','no_rename','ca_rules','ca_vote','k1_qian','k1_wreath','mil_unit','k1_lock'], avoid:['k7_go']},
  reconcile:{prefs:['dissent','go_back','talk_cwd','kp_talk','visit_hosp','let_north','buffer','assoc_all','seat_cwd','reconcile','cr_both','k2_fq_free','k2_disarm'], avoid:['k7_go']},
  drift:  {prefs:['dissent','go_back','talk_cwd','kp_talk','visit_hosp','add_temp','tw_quota','tw_keep','qh_keep','geng_talk','fan_open','ls_talk','protect','mil_unit','nj_both','qd_rules','gx_hide','ags_mix','ll_quiet','nx_mill','k2_fq_free','k2_vote'], avoid:['no_rename','reconcile','register','seat_cwd','elect']}
};
(async()=>{
  const only = process.argv[2];
  const b = await chromium.launch(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {});
  const errs = [];
  for(const [name,R] of Object.entries(ROUTES)){
    if(only && only!==name) continue;
    const p = await b.newPage({viewport:{width:360,height:780}});
    p.on('pageerror', e=>errs.push(name+': '+e.message));
    await p.route(/fonts\./, r=>r.abort());
    await p.goto(FILE); await p.evaluate(()=>localStorage.clear()); await p.goto(FILE); await p.click('#start');
    const trail = [];
    for(let i=0;i<260;i++){
      const ow = await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth); if(ow>0) errs.push(name+' overflow '+(await p.$eval('h2',x=>x.textContent))+' '+ow);
      const scene = await p.evaluate(()=>window.__mfm.st.scene);
      if(await p.$('#again')){
        if(scene==='endw') break;
        const n = await p.$('#next'); if(n){ trail.push('|'); await n.click(); continue; }
        break;
      }
      if(await p.$('#c-end')){ trail.push(scene+'!'); await p.click('#c-end'); continue; }
      const pick = await p.evaluate(([R,death])=>{
        const M = window.__mfm, st = M.st, sc = M.SC[st.scene];
        const cs = typeof sc.choices==='function' ? sc.choices() : sc.choices;
        const ok = cs.map((c,i)=>({c,i})).filter(o=>!o.c.lock && !death.includes(o.c.set) && !(R.avoid||[]).includes(o.c.set));
        const pref = ok.find(o=>R.prefs.includes(o.c.set));
        if(pref) return pref.i;
        const hx = M.HX[st.scene];
        if(R.hist && hx){ const h = ok.find(o=>hx.h.includes(o.c.set)); if(h) return h.i; }
        const o = ok.find(o=>!o.c.grown) || ok[0]; return o.i;
      }, [R, DEATH]);
      trail.push(scene);
      await p.click(`.choice[data-i="${pick}"]`);
    }
    const res = await p.evaluate(()=>{ const M = window.__mfm, st = M.st; const w = st.world; return {scene:st.scene, branch:st.branch, code:w&&w.code, dec:w&&M.decodeWorld(w.code), ax:['voice','hand','clean','ladder'].map(k=>M.ax(k))}; });
    const wp = await p.$eval('.world', x=>x.innerText).catch(()=>'(no world panel)');
    console.log('\n==', name, res.scene, res.branch, res.code, 'ax', res.ax.join(','));
    console.log('   ', trail.join(' > '));
    console.log('   decode ok', res.dec && res.dec.ok, res.dec && res.dec.typeName, res.dec && res.dec.facts.map(f=>f.label).join('；'));
    console.log(wp.split('\n').map(l=>'    | '+l).join('\n'));
    await p.screenshot({path:require('os').tmpdir()+'/r13_'+name+'.png', fullPage:true});
    // 一种后来
    const n = await p.$('#next');
    if(n){ await n.click(); for(let k=0;k<20;k++){ if(await p.$('#again')){ const nn = await p.$('#next'); if(nn){ await nn.click(); continue; } break; } const c = await p.$('.choice[data-i], #c-end'); if(!c) break; await c.click(); }
      console.log('   一种后来 ->', await p.$eval('h2',x=>x.textContent), 'world still', await p.evaluate(()=>window.__mfm.st.world && window.__mfm.st.world.code)); }
    await p.close();
  }
  console.log('\nerrors', errs);
  await b.close();
})().catch(e=>{ console.error(e); process.exit(1); });
