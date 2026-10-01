// Disposable browser context: current study, persisted panorama sampling and real PNG evidence.
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const out='.test-output/workspace';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width:1440,height:1080}}),page=await context.newPage();
const errors=[],evidence={viewports:[],counts:[],fits:[]};page.on('pageerror',e=>errors.push(e.message));
const colours=()=>page.locator('.swatch-caption small').allTextContents();
const ready=()=>expect(page.getByRole('button',{name:'Lock palette',exact:true})).toBeEnabled();
try{
 await page.goto((process.env.PALETTE_TEST_URL||'http://127.0.0.1:5178/'));await ready();await expect(page.locator('.brand')).toHaveText('pigment');
 await page.locator('.big-swatch').nth(2).click();await expect(page.locator('.big-swatch').nth(2)).toHaveAttribute('aria-pressed','true');
 await page.locator('.big-swatch').nth(1).focus();await page.keyboard.press('Space');await expect(page.locator('.big-swatch').nth(1)).toHaveAttribute('aria-pressed','true');
 const before=await colours();await page.getByRole('button',{name:'Adjust colour',exact:true}).click();await page.getByLabel('Hex colour',{exact:true}).fill('#abcdef');await page.getByRole('button',{name:'Cancel',exact:true}).click();expect(await colours()).toEqual(before);
 await page.getByRole('button',{name:'Adjust colour',exact:true}).click();await page.getByLabel('Hex colour',{exact:true}).fill('#abcdef');await page.getByRole('button',{name:'Apply colour',exact:true}).click();const after=await colours();expect(after[1]).toBe('#ABCDEF');expect(after.filter((_,i)=>i!==1)).toEqual(before.filter((_,i)=>i!==1));
 await page.getByRole('button',{name:'Lock palette',exact:true}).click();await page.getByRole('button',{name:'Develop this colour'}).first().click();await page.getByRole('button',{name:'Develop this colour'}).first().click();
 await page.locator('.tone-chip').first().focus();await page.keyboard.press('Enter');await expect(page.locator('.tone-chip').first()).toHaveAttribute('aria-pressed','true');
 await page.locator('.tone-choices button').nth(2).click();const manual=await page.locator('.tone-chip small').first().innerText();expect(manual).toBe(after[2]);
 await page.getByRole('button',{name:'Done',exact:true}).click();const neighbour=await page.locator('.sequence').nth(1).innerText();await page.locator('.spread-label input').first().fill('0.25');expect(await page.locator('.tone-chip small').first().innerText()).toBe(manual);expect(await page.locator('.sequence').nth(1).innerText()).toBe(neighbour);
 await page.getByRole('button',{name:'Find paint matches',exact:true}).click();await page.getByRole('button',{name:'Choose this paint'}).first().click();
 await page.locator('.paint-palette-picker').evaluate(el=>el.open=true);await page.locator('.shade-paint-targets button').first().click();await page.getByRole('button',{name:'Choose this paint'}).first().click();
 const credit=await page.locator('.image-caption strong').innerText();await page.locator('#scheme-name').fill('Pigment working study');
 const backupEvent=page.waitForEvent('download');await page.getByRole('button',{name:'Backup',exact:true}).click();const backup=JSON.parse(await fs.readFile(await(await backupEvent).path(),'utf8'));
 await fs.writeFile(`${out}/study.json`,JSON.stringify(backup,null,2));
 await page.evaluate(()=>{window.cardText=[];const f=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(text,...args){window.cardText.push(text);return f.call(this,text,...args);};});
 const pngEvent=page.waitForEvent('download');await page.getByRole('button',{name:'Export card',exact:true}).click();const png=await pngEvent;await png.saveAs(`${out}/card.png`);expect(png.suggestedFilename()).toBe('Pigment working study.png');
 const texts=await page.evaluate(()=>window.cardText);const allText=texts.join(' ');expect(allText).toContain(credit);expect(allText).toContain(backup.source.artist);expect(allText).toContain(backup.source.license);
 for(const p of backup.palette)expect(allText).toContain(p.hex.toUpperCase());for(const seq of Object.values(backup.sequences))for(const tone of seq.tones)expect(allText).toContain(tone.hex.toUpperCase());
 const paints=JSON.parse(await fs.readFile('public/paints.json','utf8')).paints;for(const id of Object.values(backup.matches)){const paint=paints.find(p=>p.id===id);expect(allText).toContain(paint.name);if(paint.code)expect(allText).toContain(paint.code);}
 const bytes=await fs.readFile(`${out}/card.png`);expect([...bytes.subarray(0,8)]).toEqual([137,80,78,71,13,10,26,10]);
 evidence.export=await page.evaluate(async({data,palette,study})=>{const img=new Image();img.src=data;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);const scale=300/25.4,{measureCard}=await import('/src/export.ts'),m=measureCard(ctx,study,(await(await fetch('/paints.json')).json()).paints);return {width:img.width,height:img.height,pixels:palette.map((p,i)=>{const pair=m.pairs.find(p=>p.cell.column===i&&p.cell.offset===0);const rgb=[...ctx.getImageData(Math.floor((pair.x+m.square/2)*scale),Math.floor((pair.y+m.square/2)*scale),1,1).data].slice(0,3);return '#'+rgb.map(v=>v.toString(16).padStart(2,'0')).join('');})};},{data:`data:image/png;base64,${bytes.toString('base64')}`,palette:backup.palette,study:backup});
 expect(evidence.export.width).toBe(2480);expect(evidence.export.height).toBe(3508);expect(evidence.export.pixels).toEqual(backup.palette.map(p=>p.hex.toLowerCase()));evidence.export.text=texts;
 await page.getByRole('button',{name:'Close',exact:true}).click();
 await page.locator('.tone-chip').first().click();
 for(const [width,height] of [[1440,1080],[390,844],[320,844]]){
  await page.setViewportSize({width,height});await page.evaluate(()=>scrollTo(0,0));
  const geometry=await page.evaluate(()=>{const image=document.querySelector('.visual-surface').getBoundingClientRect(),palette=document.querySelector('.swatch-strip').getBoundingClientRect(),details=document.querySelector('.source-details').getBoundingClientRect(),canvas=document.querySelector('.panorama-frame');return {width:innerWidth,bannerHeight:image.height,gap:palette.top-image.bottom,detailsAbove:details.bottom<=image.top,fit:canvas.getBoundingClientRect().width/canvas.getBoundingClientRect().height,overflow:document.documentElement.scrollWidth>innerWidth,fonts:document.fonts.check('16px "Instrument Sans"')&&document.fonts.check('11px "IBM Plex Mono"')};});
  expect(geometry.bannerHeight).toBe(width>800?360:200);expect(geometry.gap).toBe(16);expect(geometry.detailsAbove).toBe(true);expect(geometry.fit).toBeCloseTo(3.5);expect(geometry.overflow).toBe(false);expect(geometry.fonts).toBe(true);
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);await page.screenshot({path:`${out}/workspace-${width}.png`,fullPage:true});evidence.viewports.push(geometry);
 }
 await page.getByRole('button',{name:'Done',exact:true}).click();await page.getByRole('button',{name:'Edit palette',exact:true}).click();
 for(const width of [1440,390,320]){await page.setViewportSize({width,height:1000});for(const n of [3,4,5,6,7,8]){await page.getByLabel('Number of colours').selectOption(String(n));await expect(page.locator('.big-swatch')).toHaveCount(n);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);evidence.counts.push({width,n});}}
 await page.getByLabel('Number of colours').selectOption('5');
 for(const [name,width,height] of [['portrait',300,900],['square',600,600],['landscape',900,300]]){
  const data=await page.evaluate(({width,height})=>{const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');['#ff0000','#00ff00','#0000ff'].forEach((hex,i)=>{ctx.fillStyle=hex;ctx.fillRect(i*width/3,0,width/3,height);});return c.toDataURL('image/png').split(',')[1];},{width,height});
  await page.locator('input[type=file]').first().setInputFiles({name:`${name}.png`,mimeType:'image/png',buffer:Buffer.from(data,'base64')});await ready();await expect(page.locator('.image-caption strong')).toHaveText(name);
  await page.getByRole('button',{name:'Sample',exact:true}).click();const canvas=page.locator('.panorama-frame'),r=await canvas.boundingBox();
  const expected=await page.evaluate(async({width,height})=>{const {panoramaCrop}=await import('/src/framing.ts');const img=document.querySelector('.panorama-frame img');const source={crop:{x:0,y:0,w:100,h:100}};const crop=panoramaCrop(source,width,height);const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');ctx.drawImage(img,0,0);return '#'+[...ctx.getImageData(Math.floor((crop.x+crop.w*.1)/100*width),Math.floor((crop.y+crop.h*.5)/100*height),1,1).data].slice(0,3).map(v=>v.toString(16).padStart(2,'0')).join('');},{width,height});
  await canvas.click({position:{x:r.width*.1,y:r.height*.5}});expect((await colours())[0].toLowerCase()).toBe(expected);await page.getByRole('button',{name:'Sampling…',exact:true}).click();evidence.fits.push({name,width,height,sampled:expected});
 }
 const valid=await colours();await page.locator('input[type=file]').first().setInputFiles({name:'broken.png',mimeType:'image/png',buffer:Buffer.from('invalid')});await expect(page.getByRole('alert')).toBeVisible();expect(await colours()).toEqual(valid);await expect(page.locator('.image-caption strong')).toHaveText('landscape');
 expect(errors).toEqual([]);evidence.errors=errors;await fs.writeFile(`${out}/results.json`,JSON.stringify(evidence,null,2));console.log('Pigment passed: pointer/keyboard selection, Apply/Cancel, independent/manual shades, real PNG decoded/exact pixels/credits/paint codes, 3–8 colours at three widths, portrait/square/landscape panorama sampling and failed-image recovery; zero axe/page errors.');
}finally{await browser.close();}
