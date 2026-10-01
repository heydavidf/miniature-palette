"""Verify actual downloaded PDF geometry and embedded pixels (requires Poppler + Pillow)."""
import json,re,subprocess,tempfile
from pathlib import Path
from PIL import Image
root=Path('.test-output/compact/panorama')
study=json.loads((root/'study.json').read_text());scale=300/25.4
cells=[]
for col,p in enumerate(study['palette']):
 cells.append((col,0,p['hex']))
 seq=study['sequences'].get(p['id'])
 if seq:
  cells.extend((col,i-seq['anchor'],t['hex']) for i,t in enumerate(seq['tones']) if i!=seq['anchor'])
metrics=json.loads((root/'results.json').read_text())['digital']['metrics']
square=metrics['square']
report={}
with tempfile.TemporaryDirectory() as tmp:
 for name,count in [('card',1),('proof',2)]:
  info=subprocess.check_output(['pdfinfo',str(root/f'{name}.pdf')],text=True)
  assert int(re.search(r'Pages:\s+(\d+)',info)[1])==count
  w,h=map(float,re.search(r'Page size:\s+([\d.]+) x ([\d.]+)',info).groups())
  dimensions=(210,297) if name=='card' else (297,210)
  raster=(2480,3508) if name=='card' else (3508,2480)
  assert abs(w*25.4/72-dimensions[0])<.01 and abs(h*25.4/72-dimensions[1])<.01
  prefix=str(Path(tmp)/name);subprocess.run(['pdfimages','-png',str(root/f'{name}.pdf'),prefix],check=True)
  images=[Image.open(p).convert('RGB') for p in sorted(Path(tmp).glob(f'{name}-*.png')) if Image.open(p).mode=='RGB']
  assert len(images)==count
  for img in images:
   assert img.size==raster
   # Every page retains the study identity, including continuation pages.
   crop=img.crop((int(10*scale),int(8*scale),int(50*scale),int(16*scale)))
   assert sum(max(pixel)<150 for pixel in crop.get_flattened_data())>500
  if name=='card':
   for pair in metrics['pairs']:
    hexvalue=pair['cell']['hex'];page=0;x=pair['x'];y=pair['y']
    cx,cy=round((x+square/2)*scale),round((y+square/2)*scale)
    expected=tuple(bytes.fromhex(hexvalue[1:]));assert images[page].getpixel((cx,cy))==expected
    # Count the unchanged colour span through the square centre in both axes.
    for axis,centre in [(0,cx),(1,cy)]:
     lo=hi=centre
     def at(n):return images[page].getpixel((n,cy) if axis==0 else (cx,n))
     while at(lo-1)==expected:lo-=1
     while at(hi+1)==expected:hi+=1
     # Two antialiased raster edge pixels can reduce the exact RGB span by <0.2 mm.
     assert abs((hi-lo+1)/scale-square)<.2
  else:
   img=images[0];y=round(45*scale)
   dark=[x for x in range(round(5*scale),round(65*scale)) if max(img.getpixel((x,y)))<150]
   assert abs((max(dark)-min(dark)+1)/scale-.2-50)<.15
  report[name]={'pages':count,'millimetres':[w*25.4/72,h*25.4/72],'raster':raster,'headers':'present'}
(root/'print-verification.json').write_text(json.dumps(report,indent=2))
print(f'Downloaded PDFs passed: one A4 portrait card, exact RGB pixels, {square} mm clear squares, 50 mm proof line. Physical paper remains untested.')
