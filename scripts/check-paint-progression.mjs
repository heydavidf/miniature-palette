import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const out='.test-output/portrait';await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});const results=[];
try{for(const width of [1440,390,320]){
 const context=await browser.newContext({viewport:{width,height:1080},reducedMotion:'reduce'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.PALETTE_TEST_URL||'http://127.0.0.1:5178/'));await expect(page.getByRole('button',{name:'Lock palette',exact:true})).toBeEnabled();
 await page.getByRole('button',{name:'Lock palette',exact:true}).click();await page.getByRole('button',{name:'Develop this colour'}).first().click();
 await page.getByRole('button',{name:'Find paint matches',exact:true}).click();await page.getByLabel('Paint brand',{exact:true}).selectOption('Vallejo');
 await page.getByLabel('Paint range',{exact:true}).selectOption('Model Color');
 const backup=async()=>{const d=page.waitForEvent('download');await page.getByRole('button',{name:'Backup',exact:true}).click();return JSON.parse(await fs.readFile(await(await d).path(),'utf8'));};
 const before=await backup(),keys=before.palette.flatMap(p=>[p.id,...(before.sequences[p.id]?[0,1,2].map(i=>`${p.id}:${i}`):[])]),choices={};
 // Begin from first core after the independent section's current-colour shortcut.
 await page.locator('.paint-palette-picker summary').click();await page.locator('.paint-targets button').first().click();await page.locator('.paint-palette-picker summary').click();
 for(let i=0;i<keys.length;i++){
  await expect(page.locator('.paint-step-current strong')).toHaveText(`Colour ${i+1} of ${keys.length}`);
  const candidate=page.locator('.paint-copy button').first(),name=await page.locator('.paint-copy h3').first().innerText();
  await candidate.scrollIntoViewIfNeeded();await candidate.focus();const y=await page.evaluate(()=>scrollY),box=await candidate.boundingBox();await page.keyboard.press('Enter');
  await expect(page.locator('.paint-progress')).toContainText(`${i+1} of ${keys.length} paints selected`);
  expect(await page.getByLabel('Paint brand',{exact:true}).inputValue()).toBe('Vallejo');expect(await page.getByLabel('Paint range',{exact:true}).inputValue()).toBe('Model Color');
  if(i<keys.length-1){await expect(page.locator('.paint-step-current strong')).toHaveText(`Colour ${i+2} of ${keys.length}`);expect(Math.abs((await page.evaluate(()=>scrollY))-y)).toBeLessThanOrEqual(2);expect(Math.abs((await page.locator('.paint-copy button').first().boundingBox()).y-box.y)).toBeLessThanOrEqual(2);expect(await page.locator('.paint-copy button').first().evaluate(el=>el===document.activeElement)).toBe(true);}
  choices[keys[i]]=name;
 }
 await expect(page.locator('.paint-step-current strong')).toHaveText('All paints selected');await expect(page.getByRole('button',{name:'Next paint colour'})).toBeDisabled();
 const saved=await backup();expect(Object.keys(saved.matches)).toEqual(keys);expect(saved.palette).toEqual(before.palette);expect(saved.sequences).toEqual(before.sequences);expect(saved.source).toEqual(before.source);
 await page.getByRole('button',{name:'Previous paint colour'}).click();await expect(page.getByRole('button',{name:'Selected',exact:true})).toHaveCount(1);await page.getByRole('button',{name:'Next paint colour'}).click();await expect(page.getByRole('button',{name:'Selected',exact:true})).toHaveCount(1);
 // Direct revisit retains both core and anchor assignments.
 await page.locator('.paint-palette-picker summary').click();await page.locator('.shade-paint-targets button').nth(1).click();await expect(page.getByRole('button',{name:'Selected',exact:true})).toHaveCount(1);await page.locator('.paint-palette-picker summary').click();
 await page.locator('.paint-section').scrollIntoViewIfNeeded();expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);await page.screenshot({path:`${out}/paint-${width}.png`,fullPage:true});
 await page.getByRole('button',{name:'Save scheme',exact:true}).click();await page.reload();await expect(page.getByRole('button',{name:'Lock palette',exact:true})).toBeEnabled();await page.getByRole('button',{name:'My schemes',exact:true}).click();await page.locator('.saved-open').click();expect((await backup()).matches).toEqual(saved.matches);
 expect(errors).toEqual([]);results.push({width,keys,choices,filters:'retained',focus:'retained',scroll:'within 2px',saved:'round trip',axe:0,errors});await context.close();
 }await fs.writeFile(`${out}/paint-progression.json`,JSON.stringify(results,null,2));console.log('Paint progression passed at 1440/390/320: sequential keys, filters, stable scroll/button location, keyboard focus, completion, previous/next/direct revisit, untouched study and save/reopen; zero axe/page errors.');
}finally{await browser.close();}
