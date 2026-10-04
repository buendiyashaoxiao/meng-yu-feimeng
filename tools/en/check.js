// node check.js chunks/NN.json out/NN.json
const fs=require("fs");const src=JSON.parse(fs.readFileSync(process.argv[2],"utf8"));let out;
try{ out=JSON.parse(fs.readFileSync(process.argv[3],"utf8")); }catch(e){ console.log("JSON 解析失败", e.message); process.exit(1); }
const bad=[];
for(const {id,src:s} of src){
  const t=out[id]; if(typeof t!=="string"){ bad.push(`${id} 缺译文`); continue; }
  const ph=s=>(s.match(/⟦\d+⟧/g)||[]).sort().join(",");
  if(ph(s)!==ph(t)) bad.push(`${id} 占位符不一致 ${ph(s)} | ${ph(t)}`);
  const tags=s=>(s.match(/<\/?[a-zA-Z][^>]*>/g)||[]).map(x=>x.replace(/\s.*$/,"").replace(/>$/,"")).sort().join(",");
  if(tags(s)!==tags(t)) bad.push(`${id} HTML 标签不一致`);
  if(/—|–/.test(t)) bad.push(`${id} 有破折号`);
  if(/!/.test(t.replace(/<!--[\s\S]*?-->/g,"")) && !/!/.test(s)) bad.push(`${id} 有感叹号`);
  const cjk=t.replace(/[（(]《[^》]*》[）)]|《[^》]*》/g,"").match(/[一-鿿]/g); if(cjk) bad.push(`${id} 还有中文 ${cjk.slice(0,6).join("")}`);
  if(/^\s/.test(s)!==/^\s/.test(t) || /\s$/.test(s)!==/\s$/.test(t)) bad.push(`${id} 首尾空白不一致`);
}
const extra=Object.keys(out).filter(k=>!src.some(x=>String(x.id)===k)); if(extra.length) bad.push("多出来的 id "+extra.slice(0,5));
console.log(bad.length?bad.join("\n"):"OK "+src.length);
process.exit(bad.length?1:0);
