"""Check downloaded default-card PDFs and PNGs independently with Poppler and Pillow."""
import json,re,subprocess,tempfile
from pathlib import Path
from PIL import Image
root=Path('.test-output/compact');data=json.loads((root/'results.json').read_text());scale=300/25.4;report=[]
with tempfile.TemporaryDirectory() as tmp:
 for record in data['downloads']:
  if 'error' in record:continue
  name=record['name'];info=subprocess.check_output(['pdfinfo',str(root/f'{name}.pdf')],text=True)
  assert int(re.search(r'Pages:\s+(\d+)',info)[1])==1
  w,h=map(float,re.search(r'Page size:\s+([\d.]+) x ([\d.]+)',info).groups());assert abs(w*25.4/72-210)<.01 and abs(h*25.4/72-297)<.01
  prefix=str(Path(tmp)/name);subprocess.run(['pdfimages','-png',str(root/f'{name}.pdf'),prefix],check=True)
  image=Image.open(next(Path(tmp).glob(f'{name}-*.png'))).convert('RGB');png=Image.open(root/f'{name}.png').convert('RGB');assert image.size==png.size==(2480,3508)
  assert image.tobytes()==png.tobytes()
  assert Image.open(root/f'{name}.png').info.get('srgb')==1
  assert all(abs(d-300)<.01 for d in Image.open(root/f'{name}.png').info['dpi'])
  metrics=record['metrics'];square=metrics['square']
  for pair in metrics['pairs']:
   x,y=round((pair['x']+square/2)*scale),round((pair['y']+square/2)*scale);expected=tuple(bytes.fromhex(pair['cell']['hex'][1:]));assert image.getpixel((x,y))==png.getpixel((x,y))==expected
   for axis,centre in [(0,x),(1,y)]:
    lo=hi=centre
    def at(n):return image.getpixel((n,y) if axis==0 else(x,n))
    while at(lo-1)==expected:lo-=1
    while at(hi+1)==expected:hi+=1
    assert abs((hi-lo+1)/scale-square)<.2
   assert pair['labelX']>pair['x']+square
  # The exported image spans the full printable 190mm, and PDF preserves PNG crop pixels.
  y=round((metrics['imageY']+metrics['imageHeight']/2)*scale)
  for x in [round(v*scale) for v in [10.2,30,100,180,199.8]]:assert image.getpixel((x,y))==png.getpixel((x,y))
  report.append({'name':name,'pages':1,'page_mm':[w*25.4/72,h*25.4/72],'image_width_mm':190,'image_height_mm':metrics['imageHeight'],'square_mm':square,'patches':len(metrics['pairs']),'rgb':'exact','span_tolerance_mm':.2})
(root/'pdf-verification.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
