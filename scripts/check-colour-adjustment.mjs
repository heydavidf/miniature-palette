import {mkdirSync} from 'node:fs';
mkdirSync(new URL('../.impeccable/review/',import.meta.url),{recursive:true});
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1080}}),page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.PALETTE_TEST_URL||'http://127.0.0.1:5178');await expect(page.locator('.big-swatch')).toHaveCount(5);
 const colours=()=>page.locator('.swatch-caption small').allTextContents();const before=await colours();
 await page.getByRole('button',{name:'Adjust colour',exact:true}).click();
 await page.getByLabel('Hex colour',{exact:true}).fill('#bf668c');
 await page.getByRole('button',{name:'Apply colour',exact:true}).click();
 const pink=await colours();expect(pink.slice(1)).toEqual(before.slice(1));expect(pink[0]).toBe('#BF668C');
 await page.getByRole('button',{name:'Lock palette',exact:true}).click();await page.getByRole('button',{name:'Develop this colour'}).first().click();
 await page.getByRole('button',{name:'Find paint matches',exact:true}).click();await page.getByRole('button',{name:'Choose this paint'}).first().click();
 const shadow=await page.locator('.tone-chip').first().innerText();
 await page.getByRole('button',{name:'Edit palette',exact:true}).click();await page.getByRole('button',{name:'Adjust colour',exact:true}).click();
 await page.getByLabel('Selected colour hue').fill('25');expect(await colours()).toEqual(pink);
 for(const [name,width,height] of [['desktop',1440,1080],['mobile',390,844]]){
  await page.setViewportSize({width,height});await page.locator('.colour-adjust-panel').scrollIntoViewIfNeeded();
  await page.screenshot({path:`.impeccable/review/adjust-${name}.png`,fullPage:true});
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 }
 await page.getByRole('button',{name:'Apply colour',exact:true}).click();const red=await colours();expect(red[0]).not.toBe(pink[0]);expect(red.slice(1)).toEqual(pink.slice(1));
 await expect(page.getByRole('button',{name:'Selected',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Undo',exact:true}).click();expect(await colours()).toEqual(pink);
 await page.getByRole('button',{name:'Adjust colour',exact:true}).click();await page.getByLabel('Selected colour hue').fill('25');await page.getByRole('button',{name:'Apply colour',exact:true}).click();
 await page.getByLabel('warmth',{exact:true}).fill('50');expect((await colours())[0]).toBe(red[0]);
 await page.getByRole('button',{name:'Lock palette',exact:true}).click();expect(await page.locator('.tone-chip').first().innerText()).not.toBe(shadow);await expect(page.locator('.tone-chip').nth(1)).toContainText(red[0]);
 await page.locator('#scheme-name').fill('Colour adjustment QA');await page.getByRole('button',{name:'Save scheme',exact:true}).click();await expect(page.getByText('Scheme saved on this browser.')).toBeVisible();
 await page.reload();await page.getByRole('button',{name:'My schemes',exact:true}).click();await page.locator('.saved-open').filter({hasText:'Colour adjustment QA'}).click();expect((await colours())[0]).toBe(red[0]);
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Backup',exact:true}).click();const path=await(await download).path();const backup=JSON.parse(await fs.readFile(path,'utf8'));expect(backup.palette[0].locked).toBe(true);expect(backup.palette[0].origin).toBe('manual');
 await page.getByRole('button',{name:'Edit palette',exact:true}).click();await page.getByRole('button',{name:'Adjust colour',exact:true}).click();await page.getByLabel('Hex colour',{exact:true}).fill('#bad');await expect(page.getByRole('button',{name:'Apply colour',exact:true})).toBeDisabled();await page.getByRole('button',{name:'Cancel',exact:true}).click();expect((await colours())[0]).toBe(red[0]);
 expect(errors).toEqual([]);console.log('Colour adjustment passed: pink→red, preview/cancel/validation, untouched neighbours, Undo, fixed tuning, linked shades, paint invalidation, save/backup, desktop/mobile axe.');
}finally{await browser.close();}
