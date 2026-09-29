import {describe,it,expect} from 'vitest';
import {generatePalette,makeSequence,selectPalette,syncSequences} from './colour';
import {targetColour,withoutSequence,copySchemeName} from './scheme-state';
import {validateScheme} from './storage';
import {neutralTuning} from './types';
import type {Scheme} from './types';
function fixture():Scheme {
 const palette=generatePalette(['#2255aa','#eedc38'],5,neutralTuning);
 return {version:1,id:'test-scheme',name:'Blue and yellow',source:{kind:'colours',title:'A colour study',seeds:['#2255aa','#eedc38'],crop:{x:0,y:0,w:100,h:100}},palette,original:structuredClone(palette),candidates:[],tuning:{...neutralTuning},locked:true,sequences:{c0:makeSequence(palette[0]),c1:makeSequence(palette[1])},matches:{c0:'blue-paint','c0:0':'shadow-paint','c0:1':'mid-paint','c0:2':'highlight-paint',c1:'yellow-paint','c1:2':'other-highlight'},updated:1};
}
describe('scheme lifecycle regressions',()=>{
 it('removing and recreating a sequence cannot resurrect old tone paint selections',()=>{const s=fixture(),next=withoutSequence(s,'c0');next.sequences.c0=makeSequence(next.palette[0]);expect(next.matches).toEqual({c0:'blue-paint',c1:'yellow-paint','c1:2':'other-highlight'});expect(s.matches['c0:2']).toBe('highlight-paint');});
 it('a removed palette colour or sequence has no paint target',()=>{const s=fixture();expect(targetColour(s,'c0')).toBe(s.palette[0].hex);expect(targetColour(withoutSequence(s,'c0'),'c0:2')).toBeUndefined();s.palette=s.palette.filter(p=>p.id!=='c0');expect(targetColour(s,'c0')).toBeUndefined();expect(targetColour(s,'c0:2')).toBeUndefined();expect(targetColour(s,'c1:8')).toBeUndefined();});
 it('removing a reused core colour preserves the chosen tone as an independent manual value',()=>{const s=fixture();s.sequences.c0.tones[2]={hex:s.palette[1].hex,coreId:'c1',manual:true,origin:'sampled'};const next=syncSequences(s.sequences,s.palette.filter(p=>p.id!=='c1'));expect(next.c0.tones[2].hex).toBe(s.palette[1].hex);expect(next.c0.tones[2].coreId).toBeUndefined();expect(next.c0.review).toBe(true);});
 it('reordered and resized image palettes keep distinct stable identifiers',()=>{const s=fixture();const previous=[s.palette[3],s.palette[0],s.palette[1]];const cs=s.palette.map(p=>({hex:p.hex,count:50}));const next=selectPalette(cs,5,neutralTuning,previous);expect(next.slice(0,3).map(p=>p.id)).toEqual(previous.map(p=>p.id));expect(new Set(next.map(p=>p.id)).size).toBe(next.length);});
});
describe('backup validation',()=>{
 it('accepts a complete round-trip scheme and an embedded-image source',()=>{const s=fixture();expect(validateScheme(JSON.parse(JSON.stringify(s)))).toBe(true);s.source={kind:'image',title:'Photo',src:'data:image/png;base64,aGVsbG8=',crop:{x:0,y:0,w:100,h:100}};expect(validateScheme(s)).toBe(true);});
 it.each([null,[],{}, {palette:[null]},'text',42])('rejects malformed input without throwing: %j',value=>{expect(()=>validateScheme(value)).not.toThrow();expect(validateScheme(value)).toBe(false);});
 it('rejects duplicate swatches, malformed tones and out-of-bounds crops',()=>{const a=fixture();a.palette[1].id=a.palette[0].id;expect(validateScheme(a)).toBe(false);const b=fixture();(b.sequences.c0.tones as unknown[])[0]=null;expect(validateScheme(b)).toBe(false);const c=fixture();c.source.crop.x=20;expect(validateScheme(c)).toBe(false);});
 it('rejects stale match keys and malformed source fields',()=>{const a=fixture();a.matches['c9:1']='stale';expect(validateScheme(a)).toBe(false);const b=fixture();(b.source as any).artist={bad:true};expect(validateScheme(b)).toBe(false);const c=fixture();c.source.src='https://example.com/remote.jpg';expect(validateScheme(c)).toBe(false);});
 it('rejects an altered anchor and invalid tuning while preserving intentional crossed values',()=>{const a=fixture();a.sequences.c0.tones[1].hex='#ffffff';expect(validateScheme(a)).toBe(false);const b=fixture();b.tuning.warmth=1000;expect(validateScheme(b)).toBe(false);const c=fixture();c.sequences.c0.tones[2]={hex:'#000000',origin:'manual',manual:true};expect(validateScheme(c)).toBe(true);});
});

it('copied 80-character names remain valid through repeated backup round trips',()=>{const s=fixture();s.name='A'.repeat(80);for(let i=0;i<6;i++){s.name=copySchemeName(s.name);expect(s.name.length).toBeLessThanOrEqual(80);expect(validateScheme(JSON.parse(JSON.stringify(s)))).toBe(true);}});
