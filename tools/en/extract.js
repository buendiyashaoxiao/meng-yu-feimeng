// 从一段 JS 源码里抽出所有含中文的字符串和模板字符串，作为翻译单元。
const acorn=require("acorn"),walk=require("acorn-walk");
const CJK=/[㐀-鿿　-〿＀-￯]/;
const CODEISH=/(\b(has|any|visited|d|f|ppl|stage|ax|ind|real|k7Free)\(|===|!==|&&|\|\|)/;
function units(code, opt={}){
  const ast=acorn.parse(code,{ecmaVersion:"latest",ranges:true});
  const out=[];
  walk.fullAncestor(ast,(n,anc)=>{
    const p=anc[anc.length-2];
    if(n.type==="Literal" && typeof n.value==="string" && CJK.test(n.value)){
      if(p && p.type==="Property" && p.key===n && !p.computed) return;           // 对象的键不翻
      if(opt.skipCode && CODEISH.test(n.value) && !/<p>|。/.test(n.value)) return;  // 条件表达式不翻
      if(opt.skip && opt.skip(n,anc,code)) return;
      out.push({type:"lit", start:n.start, end:n.end, src:n.value, q:code[n.start]});
    }
    if(n.type==="TemplateLiteral" && n.quasis.some(q=>CJK.test(q.value.cooked||""))){
      if(opt.skip && opt.skip(n,anc,code)) return;
      let src=""; n.quasis.forEach((q,i)=>{ src+=q.value.cooked; if(i<n.expressions.length) src+=`⟦${i}⟧`; });
      out.push({type:"tpl", start:n.start, end:n.end, src, exprs:n.expressions.map(e=>[e.start,e.end])});
    }
  });
  out.sort((a,b)=>a.start-b.start);
  return out;
}
// 把翻译放回去。tr(src) 返回译文或 null（不换）。
function rebuild(code, us, tr, log){
  function within(s,e){ // 范围内最外层的单元
    const r=[]; let last=-1;
    for(const u of us){ if(u.start>=s && u.end<=e && u.start>=last){ r.push(u); last=u.end; } }
    return r;
  }
  function slice(s,e){
    let o="", pos=s;
    for(const u of within(s,e)){ o+=code.slice(pos,u.start)+render(u); pos=u.end; }
    return o+code.slice(pos,e);
  }
  function render(u){
    const t=tr(u.src);
    if(u.type==="lit"){
      if(t==null) return code.slice(u.start,u.end);
      const q=u.q; let s=t.replace(/\\/g,"\\\\").replace(/\n/g,"\\n");
      s = q==="'" ? s.replace(/'/g,"\\'") : s.replace(/"/g,'\\"');
      return q+s+q;
    }
    // 模板
    const n=u.exprs.length;
    let txt = t;
    if(txt!=null){
      const ms=[...txt.matchAll(/⟦(\d+)⟧/g)].map(m=>+m[1]).sort((a,b)=>a-b);
      if(ms.length!==n || ms.some((v,i)=>v!==i)){ log && log.push(["markers",u.src.slice(0,80),txt.slice(0,80)]); txt=null; }
    }
    if(txt==null){ // 原样，但表达式里面的单元照样换
      let o="`", pos=u.start+1;
      u.exprs.forEach(([s,e])=>{ o+=code.slice(pos,s)+slice(s,e); pos=e; });
      return o+code.slice(pos,u.end-1)+"`";
    }
    const esc=x=>x.replace(/\\/g,"\\\\").replace(/`/g,"\\`").replace(/\$\{/g,"\\${");
    return "`"+txt.split(/(⟦\d+⟧)/).map(seg=>{ const m=seg.match(/^⟦(\d+)⟧$/); if(m){ const [s,e]=u.exprs[+m[1]]; return "${"+slice(s,e)+"}"; } return esc(seg); }).join("")+"`";
  }
  return slice(0, code.length);
}
module.exports={units,rebuild,CJK};
