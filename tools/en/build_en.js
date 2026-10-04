// 把英文版装进 梦与非梦.html：node build_en.js
// 中文主脚本在 <script type="text/plain" id="main-zh">，这里生成 id="main-en" 那一份和英文照片说明，
// 再放一段 boot 脚本：按 localStorage 的 mfm-lang（或地址里的 ?lang=en）挑一份执行。右上角按钮切换。
const fs=require("fs"),path=require("path"),acorn=require("acorn"),walk=require("acorn-walk");
const {units,rebuild}=require("./extract.js"),{loadMap}=require("./loadmap.js");
process.chdir(__dirname); const ROOT=path.resolve(__dirname,"../.."), FILE=ROOT+"/梦与非梦.html";
let h=fs.readFileSync(FILE,"utf8");
const map=loadMap("chunks","out");
const extra=JSON.parse(fs.readFileSync("extra_en.json","utf8"));   // 补译：后来新加或改过的中文串
const tr=s=>map.has(s)?map.get(s):(s in extra?extra[s]:null);

const mz=h.match(/<script type="text\/plain" id="main-zh">([\s\S]*?)<\/script>/); if(!mz) throw new Error("找不到 main-zh");
const code=mz[1];
const us=units(code); const log=[];
let out=rebuild(code,us,tr,log);
if(log.length) console.log("rebuild log",log.slice(0,10));
const left=[...new Set(us.filter(u=>tr(u.src)==null).map(u=>u.src))];
fs.writeFileSync("untranslated.json",JSON.stringify(left,null,1));
if(left.length) console.log("untranslated",left.length,"（写在 untranslated.json，译好放进 extra_en.json）");

// .replace("中文", …) 这类：译文里得找得到被替换的那一句
{ const ast=acorn.parse(code,{ecmaVersion:"latest"}); const all=[...map.values(),...Object.values(extra)].join("\n");
  walk.fullAncestor(ast,(n,anc)=>{ const p=anc[anc.length-2];
    if(n.type==="Literal"&&typeof n.value==="string"&&/[一-鿿。]/.test(n.value)&&p&&p.type==="CallExpression"&&p.arguments[0]===n&&p.callee.property&&["replace","includes","indexOf","split","startsWith"].includes(p.callee.property.name)){
      const t=tr(n.value); if(t && !all.includes(t)) console.log("needle missing:",n.value,"=>",t); } }); }

// 代码里跟中文写死的几处
const P=(a,b)=>{ if(!out.includes(a)){ console.log("PATCH MISS",a.slice(0,80)); return; } out=out.split(a).join(b); };
P('t().replace(/<p>十月七日早上，来了两辆车。[\\s\\S]*?<\\/p>/,','t().replace(/<p>On the morning of October 7 two cars came\\.[\\s\\S]*?<\\/p>/,');
P('const ROLE_NEAR = /书记|市长|主任|司令|总理|主席|组长|部长|政委|工人|头头|委员|之子|负责人|同志|厂|局|队|会|组|所|校|大学|军/;',
  'const ROLE_NEAR = /secretary|mayor|director|commander|premier|chairman|leader|head|minister|commissar|worker|member|son|comrade|mill|bureau|team|committee|group|school|university|army|of|the/i;');
P('if(/总理|同志|老头|主席|副主席/.test(term||"")) return "";','if(/Premier|Comrade|Old |Chairman/.test(term||"")) return "";');
P('const ym = stamp.match(/(19\\d\\d)年(?:(\\d{1,2})月)?/); if(!ym) return "";\n  const r = f(+ym[1], ym[2] ? +ym[2] : 0);',
  'const MON = {January:1,February:2,March:3,April:4,May:5,June:6,July:7,August:8,September:9,October:10,November:11,December:12};\n  const ymE = stamp.match(/(?:(January|February|March|April|May|June|July|August|September|October|November|December)\\b[^0-9]*?(?:\\d{1,2},\\s*)?)?(19\\d\\d)/); if(!ymE) return "";\n  const ym = [null, ymE[2], ymE[1] ? MON[ymE[1]] : 0];\n  const r = f(+ym[1], ym[2] ? +ym[2] : 0);');
P('/的$/.test(plain)','/\\b(of|the|a|an|by|to)\\s*$/i.test(plain)');
P('if(/^[，,]?(是|，是)|^(当了|当上|任|出任)/.test(','if(/^\\s*,?\\s*(who|was|is|became|the|a|an|then)\\b/i.test(');
P('/、$/.test(plain)','/,\\s*$/.test(plain)');
P('GLOSS[k].t.replace(/（.*?）/,"")','GLOSS[k].t.replace(/\\s*[（(].*?[）)]/,"")');
P('E.nextLabel.replace(/^第.幕　/,"")','E.nextLabel.replace(/^Act \\w+　/,"")');
P('const km = {"上海":0,"南翔":20,"安亭":37,"昆山":50,"苏州":85,"无锡":126,"常州":165,"镇江":237,"南京":303};','const km = {"Shanghai":0,"Nanxiang":20,"Anting":37,"Kunshan":50,"Suzhou":85,"Wuxi":126,"Changzhou":165,"Zhenjiang":237,"Nanjing":303};');
P('`Dream of Anting number <b>${Math.max(dreamCount,1)}</b>`','`Anting, dream no. <b>${Math.max(dreamCount,1)}</b>`');
P('.replace(/图中只画出十一辆，是示意。/, "")','.replace(/ ?Only 11 trucks are drawn, as a sketch\\./, "")');
P('.replace(/建筑样子为游戏插画。/, "")','.replace(/ ?The building is a game illustration\\./, "")');
// 存档分开，免得中文存档里的文字混进英文版
P('const SAVE_KEY = "mfm-state", DREAM_KEY = "mfm-dreams", THEME_KEY = "mfm-theme";','const SAVE_KEY = "mfm-en-state", DREAM_KEY = "mfm-en-dreams", THEME_KEY = "mfm-theme";');
P('"mfm-ach"','"mfm-en-ach"'); P('"mfm-undo"','"mfm-en-undo"'); P('const ARREST_KEY = "mfm-arrested"','const ARREST_KEY = "mfm-en-arrested"');
const cjk=(out.replace(/\/\*[\s\S]*?\*\//g,"").replace(/[（(]《[^》]*》[）)]|《[^》]*》|〈[^〉]*〉/g,"").match(/[一-鿿]/g)||[]).length;
console.log("英文脚本里剩下的汉字（去掉注释和书名）", cjk);

// 照片说明
const PH=JSON.parse(fs.readFileSync("photos_en.json","utf8"));
const zhPhotos=JSON.parse(h.match(/<script type="application\/json" id="photos">([\s\S]*?)<\/script>/)[1]);
for(const k in zhPhotos) if(!PH[k]) console.log("照片没有英文说明",k);
const phEn=JSON.stringify(PH);

const BOOT=`<script id="boot">
/* 语言：zh 或 en。按钮切换以后存进 localStorage 再刷新。 */
(()=>{
  let L = "zh";
  try{ L = new URLSearchParams(location.search).get("lang") || localStorage.getItem("mfm-lang") || "zh"; }catch(e){}
  const en = document.getElementById("main-en");
  if(L!=="en" || !en || !en.textContent.trim()) L = "zh";
  const $ = s => document.querySelector(s);
  if(L==="en"){
    document.documentElement.lang = "en"; document.title = "Dream and Not Dream";
    $("#actname").textContent = "Dream and Not Dream";
    $("#sheet").setAttribute("aria-label","Glossary"); $("#sheet .x").textContent = "Close"; $("#sheet .x").setAttribute("aria-label","Close");
    $("#lightbox").setAttribute("aria-label","Enlarged view"); $("#lightbox .lb-bar span").textContent = "Drag sideways to see more"; $("#lb-x").textContent = "Close";
    try{ const ph = $("#photos"), zh = JSON.parse(ph.textContent), add = JSON.parse($("#photos-en").textContent);
      for(const k in zh) if(add[k]) Object.assign(zh[k], add[k]); ph.textContent = JSON.stringify(zh); }catch(e){}
  }
  const b = $("#lang");
  if(b){ b.textContent = L==="en" ? "中文" : "English"; b.lang = L==="en" ? "zh" : "en";
    b.onclick = () => { try{ localStorage.setItem("mfm-lang", L==="en" ? "zh" : "en"); }catch(e){}
      const u = new URL(location.href); u.searchParams.delete("lang"); location.replace(u.toString()); }; }
  const s = document.createElement("script"); s.textContent = document.getElementById("main-"+L).textContent; document.body.appendChild(s);
})();
</script>`;
const safe=x=>x.replace(/<\/script/gi,"<\\/script");
const ENBLOCK=`<script type="text/plain" id="main-en">${safe(out)}</script>\n<script type="application/json" id="photos-en">${safe(phEn)}</script>\n${BOOT}`;
// 去掉旧的，再接在 main-zh 后面
h=h.replace(/\n?<script type="text\/plain" id="main-en">[\s\S]*?<\/script>\n<script type="application\/json" id="photos-en">[\s\S]*?<\/script>\n<script id="boot">[\s\S]*?<\/script>/,"");
const end=h.indexOf("</script>",h.indexOf('id="main-zh"'))+9;
h=h.slice(0,end)+"\n"+ENBLOCK+h.slice(end);
if(!h.includes('html[lang="en"] .choice.grown::before'))
  h=h.replace("</style>",'html[lang="en"] .choice.grown::before{content:"Unlocked path　Did not happen in history"}\nhtml[lang="en"] .hero h1 .en-title{display:block;font-family:var(--serif);font-weight:700;letter-spacing:.02em;font-size:.5em;line-height:1.1;margin-top:.15em}\nhtml[lang="en"] .hero h1 small{letter-spacing:.06em}\n</style>');
fs.writeFileSync(FILE,h);
console.log("写好了", FILE, Math.round(h.length/1024)+"K 字符");
