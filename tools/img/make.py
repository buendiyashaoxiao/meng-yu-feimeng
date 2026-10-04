# 把作者给的 AI 生成图加上正确的字，压缩成内嵌用的 JPEG。
# 原图（作者 10 月 4 日发来的十张 PNG）不放进仓库，按 名字_src.png 放在这个目录里再跑：python3 make.py
# 输出 ai_imgs.json，内容要并进 梦与非梦.html 里 #photos 的 ai_ 开头那几项。
import numpy as np, json, base64, io, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
D=os.path.dirname(os.path.abspath(__file__))
SERB="/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc"; SERR="/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc"
SANS="/usr/share/fonts/opentype/noto/NotoSansCJK-Black.ttc"
def F(path,size,idx=2): return ImageFont.truetype(path,size,index=idx)   # index 2 = SC
def coeffs(dst,src):
    A=[];B=[]
    for (x,y),(X,Y) in zip(dst,src):
        A.append([x,y,1,0,0,0,-X*x,-X*y]); B.append(X)
        A.append([0,0,0,x,y,1,-Y*x,-Y*y]); B.append(Y)
    return np.linalg.solve(np.array(A,float),np.array(B,float)).tolist()
def warp(layer,quad,size):
    w,h=layer.size
    return layer.transform(size,Image.PERSPECTIVE,coeffs(quad,[(0,0),(w,0),(w,h),(0,h)]),Image.BICUBIC)
def ink(base,layer,mode="multiply",op=1.0):
    b=np.asarray(base).astype(float)/255; l=np.asarray(layer).astype(float)/255
    a=l[...,3:4]*op; c=l[...,:3]
    if mode=="multiply": out=b*(1-a)+b*c*a
    else:
        lum=b.mean(axis=2,keepdims=True); tex=0.75+0.35*(lum/ (lum.mean()+1e-6))
        out=b*(1-a)+np.clip(c*tex,0,1)*a
    return Image.fromarray((np.clip(out,0,1)*255).astype("uint8"))
def text(d,xy,s,font,fill,anchor="mm",spacing=0):
    if not spacing: d.text(xy,s,font=font,fill=fill,anchor=anchor); return
    widths=[d.textlength(ch,font=font) for ch in s]; tot=sum(widths)+spacing*(len(s)-1)
    x=xy[0]-tot/2
    for ch,wd in zip(s,widths): d.text((x+wd/2,xy[1]),ch,font=font,fill=fill,anchor="mm"); x+=wd+spacing
def src(n): return Image.open(f"{D}/{n}_src.png").convert("RGB")
OUT={}
def save(n,im,maxw=960,q=72):
    if im.width>maxw: im=im.resize((maxw,round(im.height*maxw/im.width)),Image.LANCZOS)
    im.save(f"{D}/{n}.jpg",quality=q,optimize=True,progressive=True)
    OUT[n]={"w":im.width,"h":im.height,"src":"data:image/jpeg;base64,"+base64.b64encode(open(f"{D}/{n}.jpg","rb").read()).decode()}

# 1 车票
im=src("ticket"); L=Image.new("RGBA",(800,400),(0,0,0,0)); d=ImageDraw.Draw(L)
INK=(40,32,24,235)
text(d,(330,40),"上海铁路局　客票",F(SERB,30),INK,spacing=6)
text(d,(205,190),"上海",F(SERB,92),INK,spacing=10)
text(d,(520,190),"南京",F(SERB,92),INK,spacing=10)
text(d,(330,365),"特快　14次　　硬座",F(SERB,30),INK)
text(d,(205,275),"限乘当日当次车",F(SERR,24),INK)
L2=Image.new("RGBA",(800,400),(0,0,0,0)); d2=ImageDraw.Draw(L2)
text(d2,(725,170),"1966",F(SERB,30),(150,40,30,230)); text(d2,(725,215),"11.10",F(SERB,30),(150,40,30,230))
q=[(383,498),(1010,405),(1122,690),(425,818)]
im=ink(im,warp(L,q,im.size)); im=ink(im,warp(L2,q,im.size))
save("ticket",im)

# 2 上柴、卡车、大字报：卡车的横幅写上“第二兵团”
save("ladder",src("ladder"))
im=src("trucks"); L=Image.new("RGBA",(280,130),(0,0,0,0)); d=ImageDraw.Draw(L)
text(d,(140,62),"第二兵团",F(SERB,58),(25,22,20,230),spacing=4)
im=ink(im,warp(L,[(497,503),(766,468),(770,598),(500,628)],im.size)); save("trucks",im)
save("dazibao",src("dazibao"))

# 3 袖章
im=src("armbands")
L=Image.new("RGBA",im.size,(0,0,0,0)); d=ImageDraw.Draw(L)
text(d,(462,450),"造反队",F(SERB,190),(244,206,96,235),spacing=30)
im=ink(im,L,"normal",0.9)
L=Image.new("RGBA",(650,185),(0,0,0,0)); d=ImageDraw.Draw(L)
text(d,(325,95),"工人赤卫队",F(SERB,112),(170,38,28,240),spacing=12)
im=ink(im,warp(L,[(940,532),(1590,552),(1588,715),(935,692)],im.size))
save("armbands",im)

# 4 六堆袖章：标签上的字改成赤卫队
im=src("piles"); d=ImageDraw.Draw(im,"RGBA")
LAB=[(352,673,92,40,-4,30),(590,608,76,30,-3,24),(875,611,70,28,-2,22),(1128,666,78,32,4,25),(678,748,98,42,-3,33)]
for (x,y,w,h,rot,fs) in LAB:
    L=Image.new("RGBA",(w*2,h*2),(0,0,0,0)); dd=ImageDraw.Draw(L)
    dd.rectangle([0,0,w*2,h*2],fill=(52,44,42,255))
    text(dd,(w,h),"赤卫队",F(SERB,fs*2),(205,196,186,255),spacing=6)
    L=L.resize((w,h),Image.LANCZOS).rotate(rot,expand=True,resample=Image.BICUBIC).filter(ImageFilter.GaussianBlur(0.6))
    im.paste(L,(int(x-L.width/2),int(y-L.height/2)),L)
save("piles",im)

# 5 电报单和五项要求
base=src("forms"); im=base.copy(); d=ImageDraw.Draw(im,"RGBA")
INK=(30,30,48,235); RED=(150,40,30,220)
d.text((111,331),"发报局",font=F(SERR,22),fill=RED,anchor="mm"); d.text((203,331),"北京",font=F(SERB,26),fill=INK,anchor="mm")
d.text((402,331),"收报人　安亭　工人同志们",font=F(SERB,24),fill=INK,anchor="mm")
d.text((600,331),"字数",font=F(SERR,22),fill=RED,anchor="mm")
TL=["我们认为工人闹文化革命是很需要的　……","你们的这次行动，不单影响本单位的生产，","而且大大影响全国的交通　……","立即回到上海去，有问题就地解决。","小道理服从大道理，搞好生产就是大道理。"]
for i,t in enumerate(TL): d.text((95,400+i*46),t,font=F(SERR,30),fill=INK,anchor="lm")
d.text((740,628),"陈伯达",font=F(SERB,32),fill=INK,anchor="rm")
d.text((375,684),"一九六六年十一月十一日",font=F(SERR,24),fill=INK,anchor="mm")
d.text((134,684),"日期",font=F(SERR,22),fill=RED,anchor="mm")
im=Image.blend(base,im,0.92)
save("telegram",im.crop((20,250,830,895)))
# 五项要求：竖排，从右往左
cols=["一、承认上海工人革命造反总司令部是合法组织。","二、承认十一月九日大会及被迫赴北京控告","是革命行动。","（以后碰到类似情况选少数代表。）","三、这次所造成的后果由华东局、上海市委","负全部责任。","四、曹荻秋必须向群众作公开检查。","五、对上海工人革命造反总司令部工作提供","各方面的方便。","同意","一九六六年十一月十三日"]
W,H=430,630; L=Image.new("RGBA",(W,H),(0,0,0,0)); dd=ImageDraw.Draw(L)
cw=W/11; f=F(SERR,25); fb=F(SERB,25)
for i,c in enumerate(cols):
    x=W-cw*(i+0.5); y=18
    col=(40,60,140,235) if c.startswith("（") else INK
    if c=="同意": x=W-cw*(i+0.5); y=H*0.55
    for ch in c:
        if ch in "，。、": dd.text((x+8,y+6),ch,font=f,fill=col,anchor="mm")
        elif ch in "（）": dd.text((x,y+13),"︵" if ch=="（" else "︶",font=f,fill=col,anchor="mm")
        else: dd.text((x,y+13),ch,font=fb if c=="同意" else f,fill=col,anchor="mm")
        y+=26.5
im=ink(base,warp(L,[(892,328),(1318,368),(1295,990),(862,962)],base.size))
save("five",im.crop((805,265,1430,1065)))

# 6 报纸
im=src("notice"); d=ImageDraw.Draw(im,"RGBA")
L=Image.new("RGBA",im.size,(0,0,0,0)); dl=ImageDraw.Draw(L)
text(dl,(333,137),"文汇报",F(SERB,96),(246,236,214,240),spacing=24)
im=ink(im,L,"normal",0.9)
# 标题：先盖一层纸色，再写字
rng=np.random.default_rng(3); box=(118,208,968,312)
patch=np.asarray(im.crop((118,1010,968,1114))).astype(float)   # 下半部纸面附近没有字的一条？不够干净就用噪声纸
paper=np.full((box[3]-box[1],box[2]-box[0],3),(210,192,164),float)+rng.normal(0,9,(box[3]-box[1],box[2]-box[0],1))
pim=Image.fromarray(np.clip(paper,0,255).astype("uint8")).filter(ImageFilter.GaussianBlur(1.2))
mask=Image.new("L",pim.size,0); ImageDraw.Draw(mask).rounded_rectangle([4,4,pim.width-4,pim.height-4],6,fill=255); mask=mask.filter(ImageFilter.GaussianBlur(3))
im.paste(pim,box[:2],mask)
L=Image.new("RGBA",im.size,(0,0,0,0)); dl=ImageDraw.Draw(L)
text(dl,(543,262),"紧急通告",F(SERB,92),(28,24,22,240),spacing=60)
im=ink(im,L)
d=ImageDraw.Draw(im,"RGBA")
d.text((762,98),"一九六七年一月九日　星期一",font=F(SERB,22),fill=(40,36,32,220),anchor="mm")
save("notice",im,maxw=720)
im=src("paper")
for txt,q,fs,sp in [("解放日报",[(323,262),(838,318),(815,402),(320,345)],110,40),("红卫战报",[(1012,447),(1212,500),(1195,578),(995,525)],70,14)]:
    w,h=(q[1][0]-q[0][0]),(q[3][1]-q[0][1]); L=Image.new("RGBA",(w*2,h*2),(0,0,0,0)); dl=ImageDraw.Draw(L)
    text(dl,(w,h),txt,F(SERB,fs),(244,234,212,240),spacing=sp)
    im=ink(im,warp(L,q,im.size),"normal",0.9)
save("paper",im)

# 7 地图底纸
save("map",src("map"),maxw=900,q=70)
json.dump(OUT,open(f"{D}/ai_imgs.json","w"))
print({k:(v["w"],v["h"],len(v["src"])//1024) for k,v in OUT.items()})
