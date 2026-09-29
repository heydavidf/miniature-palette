import {converter,formatHex,clampChroma,differenceCiede2000} from 'culori';
import type {Candidate,Paint,Sequence,Swatch,Tone,Tuning} from './types';
export const oklch=converter('oklch');
const lab=converter('lab');
const delta=differenceCiede2000();
export const distance=(a:string,b:string)=>delta(a,b);
export const lightness=(hex:string)=>oklch(hex)!.l;
export function readable(hex:string){ const c=converter('rgb')(hex)!;const f=(v:number)=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;const l=.2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b);return l>.179?'#000000':'#ffffff'; }
export function colourName(hex:string){const c=oklch(hex)!;if(c.l<.22)return 'Near black';if(c.c<.035)return c.l>.83?'Chalk':c.l>.55?'Warm grey':'Charcoal';const h=c.h||0;return h<40?'Terracotta':h<80?'Ochre':h<115?'Golden yellow':h<155?'Leaf green':h<195?'Sea green':h<245?'Blue':h<295?'Indigo':h<335?'Plum':'Rose';}
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function toneHex(hex:string,l:number,hueOffset=0){const c=oklch(hex)!;return formatHex(clampChroma({mode:'oklch',l:clamp(l,.04,.97),c:c.c,h:(c.h||0)+hueOffset},'oklch'))!;}
export function adjustedColour(value:{h:number;c:number;l:number}){return formatHex(clampChroma({mode:'oklch',h:value.h,c:Math.max(0,value.c),l:clamp(value.l,0,1)},'oklch'))!;}
const offsets:Record<string,number[]>={Free:[0,45,110,190,270,320,65,235],Analogous:[0,-25,25,-50,50,75,-75,100],Complementary:[0,180,0,180,0,180,0,180],'Split complementary':[0,150,210,0,150,210,0,150],Triadic:[0,120,240,0,120,240,0,120]};
export function generatePalette(seeds:string[],count:number,tuning:Tuning):Swatch[]{
 const base=oklch(seeds[0]||'#52786c')!; const os=offsets[tuning.harmony]||offsets.Free;
 return Array.from({length:count},(_,i)=>{
  const seed=seeds[i]; const c=seed?oklch(seed)!:{...base,h:(base.h||0)+os[i],l:clamp(base.l+[0,.19,-.17,.09,-.08,.27,-.25,.14][i],.18,.88)};
  const hue=(c.h||0); const warmHue=hue+(((65-hue+540)%360)-180)*tuning.warmth*.002;
  const hex=formatHex(clampChroma({mode:'oklch',l:clamp(.55+(c.l-.55)*(1+tuning.contrast/120),.07,.95),c:Math.max(.015,c.c*(1+tuning.saturation/140)),h:warmHue},'oklch'))!;
  return {id:`c${i}`,hex,locked:false,origin:seed?'manual':'generated',weight:i===0?40:i===1?25:Math.max(5,35/(count-2))};
 });
}
// Representative source pixels, not cluster averages: every candidate really occurs in the image.
export function extractCandidates(pixels:Uint8ClampedArray):Candidate[]{
 const bins=new Map<string,{count:number;hex:string}>();
 for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]<240)continue;const key=`${pixels[i]>>4},${pixels[i+1]>>4},${pixels[i+2]>>4}`;const b=bins.get(key);if(b)b.count++;else bins.set(key,{count:1,hex:'#'+[pixels[i],pixels[i+1],pixels[i+2]].map(v=>v.toString(16).padStart(2,'0')).join('')});}
 return [...bins.values()].sort((a,b)=>b.count-a.count).slice(0,220);
}
export function selectPalette(candidates:Candidate[],count:number,tuning:Tuning,previous:Swatch[]=[]):Swatch[]{
 if(!candidates.length)return [];
 const ids=previous.slice(0,count).map(s=>s.id);while(ids.length<count){let i=0;while(ids.includes(`c${i}`))i++;ids.push(`c${i}`);}
 const chosen:Swatch[]=previous.slice(0,count).filter(s=>s.locked).map(s=>({...s}));
 const max=candidates[0].count;const base=oklch(previous[0]?.hex||candidates[0].hex)!;
 const os=offsets[tuning.harmony]||offsets.Free;
 for(let i=0;i<count;i++){
  if(previous[i]?.locked)continue;
  let best:Candidate|undefined,bestScore=-Infinity;
  for(const c of candidates){
   if(chosen.some(s=>s.hex===c.hex))continue;
   const col=oklch(c.hex)!;
   const separation=chosen.length?Math.min(...chosen.map(s=>distance(s.hex,c.hex))):0;
   const frequency=Math.sqrt(c.count/max);
   const targetHue=((base.h||0)+os[i]+360)%360;
   const hd=Math.abs((((col.h||0)-targetHue+540)%360)-180)/180;
   const warmth=Math.cos(((col.h||0)-65)*Math.PI/180);
   const extremePenalty=(col.l<.14&&col.c<.04&&c.count/max<.35)?.9:0;
   const score=-extremePenalty+frequency*2.3+Math.min(separation,40)/16 + col.c*.9 + tuning.saturation/100*(col.c*8-.6) + tuning.warmth/100*warmth + tuning.contrast/100*Math.abs(col.l-.55)*3 - (tuning.harmony==='Free'?0:hd*3.5);
   if(score>bestScore){best=c;bestScore=score;}
  }
  if(!best)break;
  chosen.push({id:ids[i],hex:best.hex,locked:false,origin:'sampled',weight:best.count});
 }
 return Array.from({length:count},(_,i)=>chosen.find(s=>s.id===ids[i])).filter(Boolean) as Swatch[];
}
export function makeSequence(core:Swatch,anchor:0|1|2=1,spread=.17):Sequence{
 const c=oklch(core.hex)!;
 const tones=[0,1,2].map(i=>i===anchor?{hex:core.hex,origin:core.origin,manual:true,coreId:core.id}:{hex:toneHex(core.hex,c.l+(i-anchor)*spread),origin:'generated',manual:false}) as [Tone,Tone,Tone];
 return {coreId:core.id,anchor,tones,spread,review:false};
}
export function updateSpread(seq:Sequence,core:Swatch,spread:number):Sequence{
 const generated=makeSequence(core,seq.anchor,spread);
 return {...seq,spread,tones:seq.tones.map((t,i)=>t.manual?t:generated.tones[i]) as [Tone,Tone,Tone]};
}
export function syncSequences(sequences:Record<string,Sequence>,palette:Swatch[]):Record<string,Sequence>{
 return Object.fromEntries(Object.entries(sequences).filter(([id])=>palette.some(s=>s.id===id)).map(([id,seq])=>{
  const core=palette.find(p=>p.id===id)!;
  const changed=seq.tones[seq.anchor].hex!==core.hex;
  const generated=changed?makeSequence(core,seq.anchor,seq.spread):seq;
  const tones=seq.tones.map((t,i)=>{if(changed&&!t.manual)return generated.tones[i];const core=palette.find(s=>s.id===t.coreId);return core?{...t,hex:core.hex,origin:core.origin}:t.coreId?{...t,coreId:undefined,manual:true}:t;}) as [Tone,Tone,Tone];
  return [id,{...seq,tones,review:seq.review||tones.some((t,i)=>t.hex!==seq.tones[i].hex||t.coreId!==seq.tones[i].coreId)}];
 }));
}
export function rankPaints(hex:string,paints:Paint[],brands:string[],range='All ranges'){
 const target=lab(hex)!;
 return paints.filter(p=>(!brands.length||brands.includes(p.brand))&&(range==='All ranges'||p.range===range)).map(p=>({paint:p,delta:delta(target,p.hex)})).sort((a,b)=>a.delta-b.delta).slice(0,3);
}
