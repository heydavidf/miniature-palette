"""Bundle public-domain Met Open Access artwork with source/credit sidecars."""
import urllib.request,json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
items=[]
for ident in [436535,45434,437980,437984,436532,435882]:
 data=json.load(urllib.request.urlopen(f'https://collectionapi.metmuseum.org/public/collection/v1/objects/{ident}'))
 if not data.get('isPublicDomain') or not data.get('primaryImageSmall'): continue
 url=data['primaryImageSmall'];path=f'images/art-{ident}.jpg'
 image=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'MiniaturePalette/1.0'})).read()
 (root/'public'/path).write_bytes(image)
 title='The Great Wave off Kanagawa' if ident==45434 else data['title'].split(' (')[0]
 item=dict(id=str(ident),title=title,artist=data['artistDisplayName'],src='/'+path,url=data['objectURL'],license='Public domain / CC0',imageSource=url)
 items.append(item)
 (root/'public'/f'{path}.json').write_text(json.dumps({'origin':url,'credit':item,'prompt':'Sourced public-domain artwork, not generated. Origin: '+url+'; credit: '+item['artist']+' — '+item['title']+'.'},indent=2))
 print(title)
if not items:raise RuntimeError('No art downloaded; existing manifest unchanged')
(root/'src/art.json').write_text(json.dumps(items,indent=2))
