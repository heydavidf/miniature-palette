import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
await fs.mkdir('.test-output/browser',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1080}}),page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.PALETTE_TEST_URL||'http://127.0.0.1:5178'));await expect(page.locator('.big-swatch')).toHaveCount(5);
 await page.getByRole('button',{name:'Lock palette',exact:true}).click();
 await page.getByRole('button',{name:'Develop this colour'}).first().click();await page.getByRole('button',{name:'Develop this colour'}).first().click();
 await page.getByRole('button',{name:'Find paint matches',exact:true}).click();
 await page.locator('.paint-palette-picker').evaluate(el=>el.open=true);await expect(page.getByRole('heading',{name:'Extended palette',exact:true})).toBeVisible();await expect(page.locator('.shade-paint-targets button')).toHaveCount(6);
 const chosen=[];
 for(let i=0;i<6;i++){
  const button=page.locator('.shade-paint-targets button').nth(i);await button.click();await expect(button).toHaveAttribute('aria-pressed','true');
  const tone=await page.locator('.tone-chip small').nth(i).innerText();await expect(page.locator('.paint-comparison strong').first()).toHaveText(tone);
  chosen.push(await page.locator('.paint-copy h3').first().innerText());await page.locator('.paint-copy button').first().click();await expect(button.getByLabel('Paint selected')).toHaveCount(1);
 }
 await page.getByLabel('Paint brand',{exact:true}).selectOption('Vallejo');await expect(page.locator('.paint-brand').first()).toContainText('Vallejo');await page.getByLabel('Paint brand',{exact:true}).selectOption('All brands');
 await page.locator('#scheme-name').fill('Extended paints QA');await page.getByRole('button',{name:'Save scheme',exact:true}).click();await expect(page.getByText('Scheme saved on this browser.')).toBeVisible();
 const backupEvent=page.waitForEvent('download');await page.getByRole('button',{name:'Backup',exact:true}).click();const backup=JSON.parse(await fs.readFile(await(await backupEvent).path(),'utf8'));expect(Object.keys(backup.matches).filter(k=>k.includes(':'))).toHaveLength(6);
 await page.evaluate(()=>{window.cardText=[];const original=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(text,...args){window.cardText.push(text);return original.call(this,text,...args);};});
 const png=page.waitForEvent('download');await page.getByRole('button',{name:'Export card',exact:true}).click();await(await png).saveAs('.test-output/browser/extended-export.png');
 const exportText=(await page.evaluate(()=>window.cardText)).join(' ');for(const name of chosen)expect(exportText).toContain(name);
 for(const [name,width,height] of [['desktop',1440,1080],['mobile',390,844]]){
  await page.setViewportSize({width,height});await page.locator('.paint-section').scrollIntoViewIfNeeded();await page.screenshot({path:`.test-output/browser/extended-${name}.png`,fullPage:true});
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 }
 await page.reload();await page.getByRole('button',{name:'My schemes',exact:true}).click();await page.locator('.saved-open').filter({hasText:'Extended paints QA'}).click();await page.getByRole('button',{name:'Find paint matches',exact:true}).click();await expect(page.locator('.shade-paint-targets [aria-label="Paint selected"]')).toHaveCount(6);
 await page.getByRole('button',{name:'Remove sequence',exact:true}).first().click();await expect(page.locator('.shade-paint-targets button')).toHaveCount(3);
 expect(errors).toEqual([]);console.log('Extended paints passed: six shade matches, colour targets, filters, selection markers, save/reopen, backup, PNG names, removal, desktop/mobile axe.');
}finally{await browser.close();}
