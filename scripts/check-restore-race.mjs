import {chromium,expect} from '@playwright/test';
import fs from 'node:fs/promises';
const fixture=JSON.parse(await fs.readFile(new URL('../examples/pink-blue-gold.json',import.meta.url),'utf8'));
const browser=await chromium.launch({headless:true});
try{
 for(const kind of ['colours','same-image']){
  const page=await browser.newPage();
  await page.addInitScript(()=>{
   const NativeWorker=window.Worker;
   window.Worker=class extends NativeWorker{
    postMessage(...args){window.analysisStarted=true;setTimeout(()=>super.postMessage(...args),400);}
   };
  });
  await page.goto(process.env.PALETTE_TEST_URL||'http://127.0.0.1:5178');
  await page.waitForFunction(()=>window.analysisStarted);
  const study=structuredClone(fixture);
  if(kind==='same-image')study.source={kind:'image',src:'/images/art-436535.jpg',title:'Synthetic restore over artwork',crop:{x:3,y:3,w:94,h:94}};
  await page.locator('input[type=file]').nth(1).setInputFiles({name:'study.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(study))});
  await expect(page.locator('.big-swatch')).toHaveCount(3);
  await page.waitForTimeout(900);
  expect(await page.locator('.swatch-caption small').allTextContents()).toEqual(['#BF668C','#2255AA','#EEDC38']);
  await expect(page.getByRole('button',{name:'Adjust colour',exact:true})).toBeEnabled();
  if(kind==='colours'){
   await page.getByRole('button',{name:'From an image',exact:true}).click();
   await expect(page.locator('.big-swatch')).toHaveCount(3);
   await expect(page.locator('.loading')).toHaveCount(0);
   expect(await page.locator('.swatch-caption small').allTextContents()).not.toEqual(['#BF668C','#2255AA','#EEDC38']);
  }
  await page.close();
 }
 console.log('Restore race passed: delayed startup analysis cannot overwrite colour or same-image backups; editing and subsequent image extraction work.');
}finally{await browser.close();}
