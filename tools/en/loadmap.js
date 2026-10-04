const fs=require("fs"),path=require("path");
function loadMap(dirC,dirO){ const map=new Map();
  for(const f of fs.readdirSync(dirC).filter(f=>f.endsWith(".json")).sort()){
    const c=JSON.parse(fs.readFileSync(path.join(dirC,f),"utf8")); const o=JSON.parse(fs.readFileSync(path.join(dirO,f),"utf8"));
    for(const {id,src} of c){ if(typeof o[id]==="string") map.set(src,o[id]); } }
  return map; }
module.exports={loadMap};
