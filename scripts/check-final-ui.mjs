import {mkdirSync} from 'node:fs';
mkdirSync(new URL('../.impeccable/review/',import.meta.url),{recursive:true});
import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
try {
 const context=await browser.newContext({viewport:{width:1440,height:1080}});
 const page=await context.newPage();
 await page.goto(process.env.PALETTE_TEST_URL||'http://127.0.0.1:5178');
 await expect(page.locator('.big-swatch')).toHaveCount(5);
 await page.getByRole('button',{name:'Lock palette',exact:true}).click();
 await page.getByRole('button',{name:'Develop this colour'}).first().click();
 for (const [tone,choice] of [[0,1],[2,2]]) {
  await page.locator('.tone-chip').nth(tone).click();
  await page.locator('.tone-choices button').nth(choice).click();
  await page.getByRole('button',{name:'Done',exact:true}).click();
 }
 await expect(page.locator('.spread-label input').first()).toBeDisabled();
 await page.locator('.tone-match').nth(2).click();
 await page.locator('.tone-chip').nth(2).click();
 const results={};
 for (const [name,width,height] of [['desktop',1440,1080],['tablet',820,1180],['mobile',390,844]]) {
  await page.setViewportSize({width,height});
  await page.locator('.tone-editor').scrollIntoViewIfNeeded();
  await page.screenshot({path:`.impeccable/review/final-${name}-tones.png`,fullPage:true});
  const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  results[name]={violations,overflow};
  expect(violations).toEqual([]);expect(overflow).toBe(false);
 }
 const suggested=page.getByRole('button',{name:'Use suggested tone',exact:true});
 await page.getByLabel('Custom sequence colour').focus();
 await page.keyboard.press('Tab');
 await expect(suggested).toBeFocused();
 results.keyboardFocus=await suggested.evaluate(el=>({outline:getComputedStyle(el).outlineStyle,width:getComputedStyle(el).outlineWidth}));
 expect(results.keyboardFocus.outline).toBe('solid');
 await page.keyboard.press('Enter');
 await expect(page.locator('.spread-label input').first()).toBeEnabled();
 await page.keyboard.press('Tab');
 await expect(page.getByLabel('Explore generated tones')).toBeFocused();
 const slider=page.getByLabel('Explore generated tones');const before=await slider.inputValue();
 await page.keyboard.press('ArrowRight');expect(await slider.inputValue()).not.toBe(before);
 await page.emulateMedia({reducedMotion:'reduce'});
 results.reducedMotion=await page.locator('.tone-editor').evaluate(el=>getComputedStyle(el).animationName);
 expect(results.reducedMotion).toBe('none');
 await fs.writeFile('.impeccable/review/final-ui.json',JSON.stringify(results,null,2));
 console.log('Final desktop/tablet/mobile tone controls, axe, keyboard recovery and reduced motion passed.');
} finally {await browser.close();}
