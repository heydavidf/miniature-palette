import {describe,it,expect} from 'vitest';
import {extractCandidates,generatePalette,makeSequence,rankPaints,selectPalette,syncSequences,updateSpread} from './colour';
import {neutralTuning} from './types';
import type {Paint,Swatch} from './types';
const swatch=(id:string,hex:string):Swatch=>({id,hex,locked:false,origin:'sampled',weight:1});
describe('image fidelity',()=>{
 it('ignores transparent pixels and returns actual source pixels',()=>{const pixels=new Uint8ClampedArray([21,42,63,255,22,43,64,255,255,0,0,0]);const cs=extractCandidates(pixels);expect(cs.every(c=>['#152a3f','#162b40'].includes(c.hex))).toBe(true);});
 it('keeps a small high-contrast accent and source fidelity across every tuning mode',()=>{const cs=[{hex:'#626262',count:1000},{hex:'#686868',count:200},{hex:'#bb2515',count:25},{hex:'#efdcba',count:150},{hex:'#283e55',count:120},{hex:'#bd913f',count:100}];for(const harmony of ['Free','Analogous','Complementary','Split complementary','Triadic']){const p=selectPalette(cs,5,{harmony,saturation:100,warmth:-50,contrast:100});expect(p.every(s=>cs.some(c=>c.hex===s.hex))).toBe(true);expect(new Set(p.map(s=>s.hex)).size).toBe(p.length);}expect(selectPalette(cs,5,neutralTuning).some(p=>p.hex==='#bb2515')).toBe(true);});
 it('preserves locked colours and handles insufficient colours',()=>{const p=selectPalette([{hex:'#111111',count:1},{hex:'#eeeeee',count:1}],5,neutralTuning,[{...swatch('c0','#123456'),locked:true}]);expect(p[0].hex).toBe('#123456');expect(p).toHaveLength(3);});
 it('handles wholly transparent input',()=>expect(extractCandidates(new Uint8ClampedArray(16))).toEqual([]));
});
describe('shading sequences',()=>{
 it('preserves a manually chosen yellow highlight while varying blue spread',()=>{const blue=swatch('c0','#2255aa'),yellow=swatch('c1','#eedc38');const seq=makeSequence(blue);seq.tones[2]={hex:yellow.hex,origin:'sampled',manual:true,coreId:yellow.id};const updated=updateSpread(seq,blue,.3);expect(updated.tones[2].hex).toBe(yellow.hex);expect(updated.tones[1].hex).toBe(blue.hex);expect(updated.tones[0].hex).not.toBe(seq.tones[0].hex);});
 it('links reused core colours and marks changed sequences for review',()=>{const blue=swatch('c0','#2255aa');const seq=makeSequence(blue);seq.tones[2]={hex:'#eedc38',origin:'sampled',manual:true,coreId:'c1'};const next=syncSequences({c0:seq},[blue,swatch('c1','#ffaa22')]);expect(next.c0.tones[2].hex).toBe('#ffaa22');expect(next.c0.review).toBe(true);});
 it('supports the core in each role',()=>{const s=swatch('c0','#2255aa');for(const anchor of [0,1,2] as const)expect(makeSequence(s,anchor).tones[anchor].hex).toBe(s.hex);});
});
describe('paint matching',()=>{
 const ps:Paint[]=[{id:'a',brand:'A',range:'Base',name:'Same',code:'',hex:'#2255aa',source:''},{id:'b',brand:'B',range:'Model',name:'Same',code:'2',hex:'#2255ab',source:''},{id:'c',brand:'A',range:'Layer',name:'Other',code:'3',hex:'#ffff00',source:''}];
 it('ranks identical swatches first and keeps duplicate names distinct',()=>{const result=rankPaints('#2255aa',ps,[]);expect(result[0].paint.id).toBe('a');expect(result[0].delta).toBeCloseTo(0);expect(result).toHaveLength(3);});
 it('respects brand and range filters, including no results',()=>{expect(rankPaints('#2255aa',ps,['B'])[0].paint.id).toBe('b');expect(rankPaints('#2255aa',ps,['A'],'Layer')[0].paint.id).toBe('c');expect(rankPaints('#2255aa',ps,['A'],'Model')).toEqual([]);});
});
it('generates valid three-to-eight-colour seed schemes',()=>{for(let n=3;n<=8;n++){const p=generatePalette(['#52786c'],n,neutralTuning);expect(p).toHaveLength(n);expect(p.every(s=>/^#[0-9a-f]{6}$/.test(s.hex))).toBe(true);}});

it('shifts pink toward red while preserving perceptual lightness and chroma',async()=>{
 const {oklch,adjustedColour}=await import('./colour');const pink=oklch('#bf668c')!;
 const red=oklch(adjustedColour({h:25,c:pink.c,l:pink.l}))!;
 expect(red.h).toBeCloseTo(25,0);expect(Math.abs(red.l-pink.l)).toBeLessThan(.005);expect(Math.abs(red.c-pink.c)).toBeLessThan(.005);
});
it('updates generated shades after a core edit but keeps independent manual tones and unrelated sequences',()=>{
 const core=swatch('c0','#bf668c'),other=swatch('c1','#2255aa');const seq=makeSequence(core),second=makeSequence(other);
 seq.tones[2]={hex:'#eedc38',origin:'manual',manual:true};
 const next=syncSequences({c0:seq,c1:second},[{...core,hex:'#bb6652'},other]);
 expect(next.c0.tones[0].hex).not.toBe(seq.tones[0].hex);expect(next.c0.tones[1].hex).toBe('#bb6652');expect(next.c0.tones[2]).toEqual(seq.tones[2]);expect(next.c1).toEqual(second);expect(next.c0.review).toBe(true);
});
