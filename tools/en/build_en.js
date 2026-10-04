// 生成英文版第一部：node build_en.js
const fs=require("fs"),acorn=require("acorn"),walk=require("acorn-walk");
const {units,rebuild}=require("./extract.js"),{loadMap}=require("./loadmap.js");
const path=require("path"); process.chdir(__dirname); const ROOT=path.resolve(__dirname,"../..");
const h=fs.readFileSync(ROOT+"/梦与非梦.html","utf8");
const map=loadMap("chunks","out");
// 几条补译
const extra={"、":", ","？？？":"???","，":", "};
const titleOld=[...map.keys()].find(s=>s.includes("<h1>梦与非梦<small>"));
const extraMissing=JSON.parse(fs.readFileSync("miss1.json","utf8"));
for(const {src} of extraMissing){
  if(src.includes('<span class="lishu"')){
    let t=map.get(titleOld).replace(/⟦2⟧/g,"⟦3⟧").replace(/⟦1⟧/g,"⟦2⟧");
    t=t.replace("<h1>Dream and Not Dream<small>",'<h1><span class="en-title">Dream and Not Dream</span><span hidden>⟦1⟧</span><small>');
    extra[src]=t;
  } else if(!(src in extra)) extra[src]=src.replace(/、/g,",");
}
const tr=s=>map.has(s)?map.get(s):(s in extra?extra[s]:null);

const m=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)]; const last=m[m.length-1]; const code=last[1];
const us=units(code); const log=[];
let out=rebuild(code,us,tr,log);
if(log.length) console.log("rebuild log",log.slice(0,10));
const left=[...new Set(us.filter(u=>tr(u.src)==null).map(u=>u.src))]; if(left.length) console.log("untranslated",left.length,left.slice(0,5));

// 检查 .replace("a","b") 这类在译文里还找得到
{ const ast=acorn.parse(code,{ecmaVersion:"latest"}); const all=[...map.values()].join("\n");
  walk.fullAncestor(ast,(n,anc)=>{ const p=anc[anc.length-2];
    if(n.type==="Literal"&&typeof n.value==="string"&&/[一-鿿]/.test(n.value)&&p&&p.type==="CallExpression"&&p.arguments[0]===n&&p.callee.property&&["replace","includes","indexOf","split","startsWith"].includes(p.callee.property.name)){
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
// 存档分开，免得中文存档里的文字混进英文版
P('const SAVE_KEY = "mfm-state", DREAM_KEY = "mfm-dreams", THEME_KEY = "mfm-theme";','const SAVE_KEY = "mfm-en-state", DREAM_KEY = "mfm-en-dreams", THEME_KEY = "mfm-theme";');
P('"mfm-ach"','"mfm-en-ach"'); P('"mfm-undo"','"mfm-en-undo"'); P('const ARREST_KEY = "mfm-arrested"','const ARREST_KEY = "mfm-en-arrested"');
P('const km = {"上海":0,"南翔":20,"安亭":37,"昆山":50,"苏州":85,"无锡":126,"常州":165,"镇江":237,"南京":303};','const km = {"Shanghai":0,"Nanxiang":20,"Anting":37,"Kunshan":50,"Suzhou":85,"Wuxi":126,"Changzhou":165,"Zhenjiang":237,"Nanjing":303};');
P('`Dream of Anting number <b>${Math.max(dreamCount,1)}</b>`','`Anting, dream no. <b>${Math.max(dreamCount,1)}</b>`');
// 第二部还只有中文


// 拼回去
let html=h.slice(0,last.index)+"<script>"+out+"</script>"+h.slice(last.index+last[0].length);
// 脚本外面的中文
const R=(a,b)=>{ if(!html.includes(a)){ console.log("HTML MISS",a.slice(0,60)); return; } html=html.split(a).join(b); };
R('<html lang="zh-CN"','<html lang="en"');
R('<title>梦与非梦</title>','<title>Dream and Not Dream</title>');
R('<span id="actname">梦与非梦</span>','<span id="actname">Dream and Not Dream</span>');
R('<a class="hbtn lang" href="梦与非梦_en.html">English</a>','<a class="hbtn lang" href="梦与非梦.html" lang="zh">中文</a>');
R('>主题 自动</button>','>Theme Auto</button>');
R('aria-label="词条"','aria-label="Glossary"'); R('aria-label="关闭">关闭</button>','aria-label="Close">Close</button>');
R('aria-label="放大查看"','aria-label="Enlarged view"'); R('<span>可以左右拖动查看</span>','<span>Drag sideways to see more</span>');
R('id="lb-x">关闭</button>','id="lb-x">Close</button>');
R('content:"解锁的路径　历史上没有"','content:"Unlocked path　Did not happen in history"');
R('.hero h1 small{color:#e3dccb;font-family:var(--sans);letter-spacing:.3em}','.hero h1 small{color:#e3dccb;font-family:var(--sans);letter-spacing:.06em}');
R('.hero h1 small{','.hero h1 .en-title{display:block;font-family:var(--serif);font-weight:700;letter-spacing:.02em;font-size:.72em;line-height:1.05}\n.hero h1 small{');
// 照片说明
const PH=JSON.parse(fs.readFileSync("photos_en.json","utf8"));
html=html.replace(/(<script type="application\/json" id="photos">)([\s\S]*?)(<\/script>)/,(_,a,b,c)=>{ const d=JSON.parse(b);
  for(const k in d){ const e=PH[k]; if(!e){ console.log("photo missing",k); continue; } Object.assign(d[k],e); } return a+JSON.stringify(d)+c; });
fs.writeFileSync(ROOT+"/梦与非梦_en.html",html);
const left2=(out.match(/[一-鿿]/g)||[]).length; console.log("written; CJK chars left in code", left2);
