// 语法快检：中文、英文两份主脚本都要能编译。用法：node tests/syntax.js
const h = require('fs').readFileSync(require('path').resolve(__dirname, '..', '梦与非梦.html'), 'utf8');
for (const id of ['main-zh', 'main-en']) {
  const m = h.match(new RegExp('<script type="text/plain" id="' + id + '">([\\s\\S]*?)</script>'));
  if (!m) { console.log('缺少', id); process.exit(1); }
  new Function(m[1]);
}
console.log('ok');
