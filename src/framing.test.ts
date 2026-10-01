import {describe,it,expect} from 'vitest';
import {panoramaCrop,moveFraming,defaultFraming} from './framing';
import {validateScheme} from './storage';
import {generatePalette,makeSequence} from './colour';
import {cardCells} from './card-layout';
import {neutralTuning} from './types';
import type {Scheme,Source} from './types';
const source:Source={kind:'image',title:'Fixture',src:'/images/art-436535.jpg',crop:{x:10,y:20,w:80,h:70}};
function fixture():Scheme{const palette=generatePalette(['#336699'],3,neutralTuning);return {version:1,id:'test',name:'Test',source:structuredClone(source),palette,original:structuredClone(palette),candidates:[],tuning:{...neutralTuning},locked:true,sequences:Object.fromEntries(palette.map((p,i)=>[p.id,makeSequence(p,i as 0|1|2)])),matches:{},updated:1};}
describe('persistent panorama',()=>{
 it.each([[300,900],[600,600],[900,300],[2400,200]])('stays inside extraction bounds and preserves its aspect (%s × %s)',(w,h)=>{for(const x of [0,.5,1])for(const y of [0,.5,1]){const r=panoramaCrop({...source,framing:{x,y,aspect:3.5}},w,h);expect(r.x).toBeGreaterThanOrEqual(10);expect(r.y).toBeGreaterThanOrEqual(20);expect(r.x+r.w).toBeLessThanOrEqual(90.00001);expect(r.y+r.h).toBeLessThanOrEqual(90.00001);expect(w*r.w/(h*r.h)).toBeCloseTo(3.5);}});
 it('old studies default to the centre; dragging clamps without touching extraction bounds',()=>{expect(panoramaCrop(source,300,900)).toEqual(panoramaCrop({...source,framing:defaultFraming},300,900));const next=moveFraming(source,300,900,0,-10000,300,90);expect(next.y).toBe(1);expect(next.x).toBe(.5);expect(source.crop).toEqual({x:10,y:20,w:80,h:70});});
 it('equivalent resized drag positions produce the same framing',()=>{expect(moveFraming(source,300,900,0,-20,300,100)).toEqual(moveFraming(source,300,900,0,-40,600,200));});
 it('restores version-1 studies with or without framing',()=>{const s=fixture();expect(validateScheme(s)).toBe(true);s.source.framing={x:.8,y:0,aspect:3.5};expect(validateScheme(JSON.parse(JSON.stringify(s)))).toBe(true);});
 it.each([null,{}, {x:-.1,y:.5,aspect:3.5},{x:.5,y:2,aspect:3.5},{x:.5,y:.5,aspect:0},{x:.5,y:.5,aspect:Infinity},{x:'0.5',y:.5,aspect:3.5}])('rejects invalid framing %j',framing=>{const s=fixture();(s.source as any).framing=framing;expect(validateScheme(s)).toBe(false);});
});
describe('comparison card roles and associations',()=>{
 it('shows one core per column and preserves all three anchor roles',()=>{const s=fixture(),cells=cardCells(s);expect(cells).toHaveLength(9);for(let column=0;column<3;column++){const columnCells=cells.filter(c=>c.column===column);expect(columnCells.filter(c=>c.offset===0)).toHaveLength(1);expect(columnCells.map(c=>c.offset)).toEqual([0,...[0,1,2].filter(i=>i!==column).map(i=>i-column)]);}});
 it('preserves differing core/anchor paints but merges the same association',()=>{const s=fixture();s.matches={c0:'a','c0:0':'b',c1:'a','c1:1':'a'};const cells=cardCells(s);expect(cells[0].associations).toEqual([{label:'Core',paintId:'a'},{label:'Shadow',paintId:'b'}]);expect(cells.find(c=>c.ref==='02C')!.associations).toEqual([{label:'Core + Midtone',paintId:'a'}]);});
 it('keeps reused and crossed manual tones, and does not invent missing sequences',()=>{const s=fixture();delete s.sequences.c2;s.sequences.c0.tones[2]={hex:s.palette[0].hex,manual:true,origin:'manual'};const cells=cardCells(s);expect(cells.filter(c=>c.column===2)).toHaveLength(1);expect(cells.find(c=>c.ref==='01H')!.hex).toBe(s.palette[0].hex);expect(cells.find(c=>c.ref==='01H')!.offset).toBe(2);});
});
