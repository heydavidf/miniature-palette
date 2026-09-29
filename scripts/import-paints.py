"""Import a pinned, attributed paint catalogue. Re-run explicitly to refresh."""
import urllib.request,json,re,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
api='https://api.github.com/repos/Arcturus5404/miniature-paints/commits/main'
sha=json.load(urllib.request.urlopen(api))['sha']
base=f'https://raw.githubusercontent.com/Arcturus5404/miniature-paints/{sha}/'
brands={'Citadel_Colour':'Citadel','Vallejo':'Vallejo','Army_Painter':'The Army Painter','AK':'AK Interactive','Monument':'Pro Acryl'}
paints=[]
exclusions=json.loads((root/'scripts/paint-exclusions.json').read_text())
for file,brand in brands.items():
 raw=urllib.request.urlopen(base+'paints/'+file+'.md').read().decode()
 header=None
 for line in raw.splitlines():
  if not line.startswith('|'): continue
  vals=[v.strip() for v in line.strip('|').split('|')]
  if vals[0]=='Name': header=vals; continue
  if not header or len(vals)!=len(header) or vals[0].startswith('---'): continue
  row=dict(zip(header,vals)); name=row['Name']; group=row.get('Set','')
  if brand=='Citadel' and group not in ['Base','Layer']: continue
  if brand=='Vallejo' and group not in ['Model Color','Game Color']: continue
  if brand=='The Army Painter' and group!='Warpaints Fanatic': continue
  if brand=='AK Interactive' and group not in ['Standard (3rd Gen)','Figures (3rd Gen)','AFV (3rd Gen)','Intense (3rd Gen)','Pastel (3rd Gen)']: continue
  if brand=='Pro Acryl' and ('Pro Acryl' not in group or 'Primer' in group): continue
  if re.search(r'metal|wash|contrast|speedpaint|\bink\b|varnish|medium|primer|discontinued|fluorescent|effect|chrome|silver|copper|bronze|brass|steel|aluminium|aluminum|gunmetal|gun metal',name+' '+group,re.I): continue
  if re.search(r'gold',name,re.I) and not re.search(r'golden? (yellow|brown|olive|flesh)|gold yellow',name,re.I): continue
  if name in exclusions.get(brand,{}).get('names',[]): continue
  if re.search(r'transparent|glaze',name,re.I): continue
  if brand=='AK Interactive' and name.startswith('Clear '): continue
  hx=re.search(r'#[0-9A-Fa-f]{6}',row.get('Hex',''))
  if not hx: continue
  code=row.get('Code',''); code='' if code=='null' else code
  ident=re.sub(r'[^a-z0-9]+','-',f'{brand}-{group}-{code or name}'.lower()).strip('-')
  if any(p['id']==ident for p in paints): continue
  paints.append(dict(id=ident,name=name,brand=brand,range=group,code=code,hex=hx[0].lower(),source=base+'paints/'+file+'.md'))
(root/'public/paints.json').write_text(json.dumps({'revision':sha,'source':'https://github.com/Arcturus5404/miniature-paints','paints':paints},indent=2))
(root/'public/PAINT-DATA-LICENSE.txt').write_bytes(urllib.request.urlopen(base+'LICENSE').read())
from collections import Counter
print('Imported',len(paints),'paints:',dict(Counter(p['brand'] for p in paints)))
print('Ranges:',dict(Counter(p['range'] for p in paints)))
