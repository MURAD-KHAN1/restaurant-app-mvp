"""Build Q1 documentation only. Requires: pip install reportlab pillow.
Run from any directory: python A2/build_documents.py
No runtime application or server code is generated or changed.
"""
from pathlib import Path
import re, math
from html import escape
from PIL import Image as PILImage, ImageDraw, ImageFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

HERE = Path(__file__).resolve().parent
DIAGRAMS = HERE / 'diagrams'
DIAGRAMS.mkdir(exist_ok=True)
FONTDIR = Path('C:/Windows/Fonts')
REGULAR = FONTDIR / 'arial.ttf'
BOLD = FONTDIR / 'arialbd.ttf'
INK = '#183247'
BLUE = '#16667B'
PALE = '#EAF3F7'
GREEN = '#267257'

def font(size=26, bold=False):
    return ImageFont.truetype(str(BOLD if bold else REGULAR), size)

def canvas(w,h,title,subtitle):
    im=PILImage.new('RGB',(w,h),'white'); d=ImageDraw.Draw(im)
    d.rectangle((0,0,w,135),fill=INK)
    d.text((60,32),title,font=font(39,True),fill='white')
    d.text((60,90),subtitle,font=font(23),fill='#D9E7EE')
    return im,d

def wrapped(d,text,x,y,width,size=25,bold=False,center=False):
    f=font(size,bold); lines=[]
    for paragraph in text.split('\n'):
        line=''
        for word in paragraph.split():
            candidate=(line+' '+word).strip()
            if d.textlength(candidate,font=f)>width and line:
                lines.append(line); line=word
            else: line=candidate
        lines.append(line)
    for i,line in enumerate(lines):
        xp=x+(width-d.textlength(line,font=f))/2 if center else x
        d.text((xp,y+i*(size+10)),line,font=f,fill=INK)
    return len(lines)*(size+10)

def arrow(d,x1,y1,x2,y2,dashed=False,color=BLUE,both=False):
    if dashed:
        length=math.hypot(x2-x1,y2-y1)
        for t in range(0,int(length),18):
            a=t/length; b=min(t+10,length)/length
            d.line((x1+(x2-x1)*a,y1+(y2-y1)*a,x1+(x2-x1)*b,y1+(y2-y1)*b),fill=color,width=3)
    else: d.line((x1,y1,x2,y2),fill=color,width=4)
    def head(x,y,dx,dy):
        ang=math.atan2(dy,dx); n=15
        d.polygon([(x,y),(x-n*math.cos(ang)-8*math.sin(ang),y-n*math.sin(ang)+8*math.cos(ang)),(x-n*math.cos(ang)+8*math.sin(ang),y-n*math.sin(ang)-8*math.cos(ang))],fill=color)
    head(x2,y2,x2-x1,y2-y1)
    if both: head(x1,y1,x1-x2,y1-y2)

def sequence():
    im,d=canvas(1800,1900,'Customer places an order','Hiba Cafe & Restaurant | Assignment 2, Question 1 | Successful path')
    xs=[245,870,1515]
    for x,label in zip(xs,['React Native App','Express Server','MongoDB']):
        d.rounded_rectangle((x-210,175,x+210,265),radius=12,fill=PALE,outline=BLUE,width=3)
        wrapped(d,label,x-195,198,390,30,True,True)
        for y in range(280,1755,22): d.line((x,y,x,y+12),fill='#A9B7C1',width=2)
    for x,y1,y2 in [(245,315,1675),(870,440,1500),(1515,645,735),(1515,1250,1345)]:
        d.rectangle((x-9,y1,x+9,y2),fill='#D1E9E2',outline=GREEN,width=2)
    def note(x,y,w,text):
        h=65
        d.rounded_rectangle((x,y,x+w,y+h),radius=10,fill='#FFF5D9',outline='#D2A643',width=2)
        wrapped(d,text,x+15,y+10,w-30,24)
    note(40,290,455,'1. Customer taps Confirm Order')
    def msg(a,b,y,text,reply=False):
        left=min(xs[a],xs[b]); width=abs(xs[a]-xs[b])-45
        height=wrapped(d,text,left+22,-2000,width,24)
        wrapped(d,text,left+22,y-height-16,width,24)
        arrow(d,xs[a]+(9 if b>a else -9),y,xs[b]-(9 if b>a else -9),y,dashed=reply)
    def selfmsg(index,y,text):
        x=xs[index]
        d.line((x+10,y,x+64,y,x+64,y+42,x+10,y+42),fill=BLUE,width=3)
        arrow(d,x+64,y+42,x+10,y+42)
        wrapped(d,text,x+87,y-6,475,24)
    msg(0,1,485,'2. POST /api/orders\nAuthorization: Bearer <JWT>\nJSON: items, orderType, table/pickup, promo')
    selfmsg(1,545,'3. Receive request; verify JWT, user role and body')
    msg(1,2,665,'4. Query MenuItems by submitted ObjectIds')
    msg(2,1,795,'5. Return MenuItems: prices and availability',True)
    selfmsg(1,870,'6. Validate items, quantities and availability')
    selfmsg(1,1010,'7. Calculate total from database prices; apply charges/tax/promo')
    msg(1,2,1240,'8. Save Order: user, item snapshots, server total, Pending, timestamps')
    msg(2,1,1380,'9. Return saved Order with _id and timestamps',True)
    msg(1,0,1515,'10. HTTP 201 Created\nJSON: saved order and authoritative total',True)
    selfmsg(0,1600,'11. Display order confirmation; clear cart after success')
    d.line((60,1780,1740,1780),fill='#CEDBE1',width=2)
    wrapped(d,'Solid arrows: requests/actions. Dashed arrows: returned data/responses.\nAuthentication/validation failures return an error without saving an Order.',65,1800,1670,24)
    im.save(DIAGRAMS/'order-sequence-diagram.png',dpi=(180,180))

def deployment():
    im,d=canvas(1800,950,'Deployment diagram','Hiba Cafe & Restaurant | Academic local network deployment')
    boxes=[(60,265,480,700),(690,265,1110,700),(1320,265,1740,700)]
    labels=[('<<device>>','Customer/Manager Phone',['React Native','Expo App','Customer / Manager UI']),('<<device>>','Laptop',['Node.js','Express Server','Port 5000']),('<<execution environment>>','Database',['MongoDB','restaurant_app database','Persistent collections'])]
    for box,(stereo,title,lines) in zip(boxes,labels):
        x1,y1,x2,y2=box
        d.polygon([(x1,y1),(x1+22,y1-22),(x2+22,y1-22),(x2+22,y2-22),(x2,y2),(x2,y1)],fill='#D2E3EC',outline=BLUE)
        d.rounded_rectangle(box,radius=10,fill=PALE,outline=BLUE,width=3)
        wrapped(d,stereo,x1+15,y1+25,x2-x1-30,20,False,True)
        wrapped(d,title,x1+15,y1+77,x2-x1-30,28,True,True)
        d.line((x1+20,y1+155,x2-20,y1+155),fill='#AEC7D3',width=2)
        for i,line in enumerate(lines): wrapped(d,line,x1+22,y1+195+i*66,x2-x1-44,28,False,True)
    arrow(d,485,505,685,505,both=True)
    wrapped(d,'HTTP / JSON',482,430,205,24,True,True)
    wrapped(d,'Requests /\nresponses',485,535,200,22,False,True)
    arrow(d,1115,505,1315,505,both=True)
    wrapped(d,'Mongoose',1118,430,195,24,True,True)
    wrapped(d,'Queries /\ndocuments',1117,535,198,22,False,True)
    wrapped(d,'Phone calls http://<laptop-LAN-IP>:5000/api on the same reachable network.\nMongoDB may run as a separate process on the laptop. Both connectors are bidirectional.\nThis figure specifies deployment; no server or database is deployed for Question 1.',65,775,1670,25)
    im.save(DIAGRAMS/'deployment-diagram.png',dpi=(180,180))

pdfmetrics.registerFont(TTFont('Arial',str(REGULAR)))
pdfmetrics.registerFont(TTFont('ArialBold',str(BOLD)))
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='BodyCustom',fontName='Arial',fontSize=9.6,leading=14.3,spaceAfter=7,textColor=colors.HexColor(INK),splitLongWords=True))
styles.add(ParagraphStyle(name='H1Custom',fontName='ArialBold',fontSize=20,leading=25,spaceAfter=14,textColor=colors.HexColor(INK),keepWithNext=True))
styles.add(ParagraphStyle(name='H2Custom',fontName='ArialBold',fontSize=13,leading=18,spaceBefore=10,spaceAfter=8,textColor=colors.HexColor(BLUE),keepWithNext=True))
styles.add(ParagraphStyle(name='H3Custom',fontName='ArialBold',fontSize=10.8,leading=15,spaceBefore=8,spaceAfter=7,textColor=colors.HexColor(INK),keepWithNext=True))
styles.add(ParagraphStyle(name='Cell',fontName='Arial',fontSize=8,leading=11,textColor=colors.HexColor(INK),splitLongWords=True))
styles.add(ParagraphStyle(name='CellHead',fontName='ArialBold',fontSize=8,leading=11,textColor=colors.white))
styles.add(ParagraphStyle(name='Cover',fontName='ArialBold',fontSize=29,leading=36,textColor=colors.HexColor(INK),alignment=TA_CENTER,spaceAfter=22))
styles.add(ParagraphStyle(name='CoverSub',fontName='Arial',fontSize=15,leading=22,textColor=colors.HexColor(BLUE),alignment=TA_CENTER,spaceAfter=16))
styles.add(ParagraphStyle(name='TOC1',fontName='Arial',fontSize=10,leading=17,spaceBefore=7))
styles.add(ParagraphStyle(name='TOC2',fontName='Arial',fontSize=9,leading=14,leftIndent=15))

class Document(SimpleDocTemplate):
    def afterFlowable(self,flow):
        if isinstance(flow,Paragraph) and flow.style.name in ('H1Custom','H2Custom'):
            txt=flow.getPlainText()
            if txt=='Contents': return
            key='heading-'+str(self.seq.nextf('heading'))
            self.canv.bookmarkPage(key)
            level=0 if flow.style.name=='H1Custom' else 1
            self.canv.addOutlineEntry(txt,key,level,False)
            self.notify('TOCEntry',(level,txt,self.page,key))

def markup(text):
    value=escape(text)
    value=re.sub(r'(https://[^\s]+)',r'<link href="\1" color="#16667B">\1</link>',value)
    return value

def para(text,style='BodyCustom'):
    return Paragraph(markup(text),styles[style])

def table(rows):
    n=len(rows[0]); width=A4[0]-84
    if n==6: ratios=[.145,.16,.095,.12,.13,.35]
    elif n==5: ratios=[.085,.185,.15,.27,.31]
    elif n==3: ratios=[.06,.43,.51] if rows[0][0]=='No.' else [.29,.25,.46]
    else: ratios=[.25,.75] if n==2 else [1/n]*n
    cells=[[para(cell,'CellHead' if i==0 else 'Cell') for cell in row] for i,row in enumerate(rows)]
    t=Table(cells,colWidths=[width*r for r in ratios],repeatRows=1,hAlign='LEFT')
    t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor(INK)),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),6),('RIGHTPADDING',(0,0),(-1,-1),6),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.HexColor('#F1F6F8'),colors.white]),('LINEBELOW',(0,0),(-1,-1),.35,colors.HexColor('#CFDDE4'))]))
    return t

def header(canvas,doc):
    canvas.saveState()
    if doc.page>1:
        canvas.setFont('Arial',8); canvas.setFillColor(colors.HexColor(BLUE))
        canvas.drawString(42,A4[1]-27,'HIBA CAFE & RESTAURANT | SRS v2.0')
        canvas.drawRightString(A4[0]-42,A4[1]-27,'Assignment 2 — Question 1')
        canvas.setStrokeColor(colors.HexColor('#CFDDE4')); canvas.line(42,A4[1]-35,A4[0]-42,A4[1]-35)
    canvas.setFont('Arial',8); canvas.setFillColor(colors.HexColor(INK))
    canvas.drawString(42,24,'Murad Khan | 9256 | Fall 2026')
    canvas.drawRightString(A4[0]-42,24,str(doc.page))
    canvas.restoreState()

def pdf():
    story=[Spacer(1,95),para('Hiba Cafe & Restaurant','Cover'),para('Software Requirements Specification','CoverSub'),para('Version 2.0 | Backend and API Design','CoverSub'),Spacer(1,25),para('Assignment 2 — Question 1','CoverSub'),para('Murad Khan | Registration No. 9256','CoverSub'),para('Fall 2026 | 2 October 2026','CoverSub'),Spacer(1,35),para('Based on the original Assignment 1 SRS and existing React Native Expo Restaurant App MVP.'),para('Documentation and design only. All pre-existing files are preserved; no backend coding for Questions 2–7 is included.'),PageBreak(),para('Contents','H1Custom')]
    toc=TableOfContents(); toc.levelStyles=[styles['TOC1'],styles['TOC2']]; story.append(toc)
    lines=(HERE/'SRS_v2.md').read_text(encoding='utf-8-sig').splitlines()
    start=next(i for i,l in enumerate(lines) if l=='## 1. Introduction'); i=start
    while i<len(lines):
        line=lines[i].strip()
        if not line: i+=1; continue
        if line.startswith('## '):
            story.append(PageBreak()); story.append(para(line[3:],'H1Custom')); i+=1
        elif line.startswith('### '):
            if line.startswith('### Figure') and not line.startswith(('### Figure 1.', '### Figure 4.')):
                story.append(PageBreak())
            story.append(para(line[4:],'H2Custom')); i+=1
        elif line.startswith('#### '):
            story.append(para(line[5:],'H3Custom')); i+=1
        elif line.startswith('|'):
            rows=[]
            while i<len(lines) and lines[i].strip().startswith('|'):
                cells=[v.strip() for v in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r'[-: ]+',c) for c in cells): rows.append(cells)
                i+=1
            story.append(table(rows)); story.append(Spacer(1,10))
        elif line.startswith('!['):
            match=re.match(r'!\[(.*?)\]\((.*?)\)',line); path=(HERE/match.group(2)).resolve()
            with PILImage.open(path) as im: w,h=im.size
            factor=min((A4[0]-84)/w,520/h)
            story.append(Image(str(path),width=w*factor,height=h*factor)); story.append(Spacer(1,12)); i+=1
        elif re.match(r'^\d+\. ',line):
            story.append(para(line)); i+=1
        elif line.startswith('- '):
            story.append(para('• '+line[2:])); i+=1
        else:
            chunks=[line]; i+=1
            while i<len(lines) and lines[i].strip() and not lines[i].startswith(('#','|','![','- ')) and not re.match(r'^\d+\. ',lines[i]):
                chunks.append(lines[i].strip()); i+=1
            story.append(para(' '.join(chunks)))
    doc=Document(str(HERE/'SRS_v2.pdf'),pagesize=A4,rightMargin=42,leftMargin=42,topMargin=52,bottomMargin=42,title='Hiba Cafe & Restaurant — SRS v2.0',author='Murad Khan (9256)',subject='Assignment 2 Question 1: SRS Update and API Design')
    doc.multiBuild(story,onFirstPage=header,onLaterPages=header)

if __name__=='__main__':
    sequence(); deployment(); pdf()
    print('Generated A2/SRS_v2.pdf and both required PNG diagrams.')
