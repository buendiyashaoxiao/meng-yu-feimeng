# 测试

都是 Playwright 脚本，在手机宽度（360px）、浅色和深色两种主题下跑游戏，报告页面错误、横向溢出和走到的结局。

```
npm i playwright            # 或用全局安装的，设 PLAYWRIGHT_PATH 指向它
CHROME_PATH=/path/to/chromium node tests/walk.js 20
```

| 脚本 | 做什么 |
|---|---|
| `walk.js [N]` | 随机走 N 局，统计到达的场景和结局，查报错和横向溢出。N 默认 60，跑满要几分钟。 |
| `policy.js` | 按固定策略（历史线、各项分量偏向）各走一局，打印路径和“开了一条路”的提示。 |
| `branchtest3.js` | 走第三幕各条 IF 线（cr、cg 等），确认能接到第四到第六幕并到达结局。 |
| `deaths6.js` | 逐个触发提前结束的局，检查“后来”、结论页、从当前幕重来、深色主题。 |
| `ifpath3.js` | 走几条 IF 线到尾声，打印每一场的标题，用来查跨幕延续和尾声分线。 |
| `start2.js` | 标题页“从某一幕开始”，选第五幕和“心软的调停者”，打印预览和进入后的场景，再走到底。改脚本里的幕和人可以测别的组合。 |
| `presetvals.js` | 打印五种人走到各幕时的四项分量，用来调平衡。 |
| `feat.js` | 按指定的选项走到某个结局或提前结束的局，再看结局页和成就记录。 |

语法快检，不开浏览器：

```
node -e "const h=require('fs').readFileSync('梦与非梦.html','utf8');const m=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)];new Function(m[m.length-1][1]);console.log('ok')"
```
