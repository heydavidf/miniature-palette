import {get,update} from 'idb-keyval';
import type {Scheme} from './types';
export const listSchemes=async():Promise<Scheme[]>=>await get('schemes')||[];
export async function saveScheme(scheme:Scheme){await update<Scheme[]>('schemes',all=>[scheme,...(all||[]).filter(s=>s.id!==scheme.id)]);}
export async function removeScheme(id:string){await update<Scheme[]>('schemes',all=>(all||[]).filter(s=>s.id!==id));}
export function download(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function validateScheme(value:unknown):value is Scheme {
 const record=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v);
 const hex=(v:unknown)=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
 const id=(v:unknown)=>typeof v==='string'&&/^c[0-9]+$/.test(v);
 const finite=(v:unknown)=>typeof v==='number'&&Number.isFinite(v);
 const origin=(v:unknown)=>['sampled','generated','manual'].includes(String(v));
 const swatch=(p:unknown)=>record(p)&&id(p.id)&&hex(p.hex)&&typeof p.locked==='boolean'&&origin(p.origin)&&finite(p.weight)&&p.weight>0;
 if(!record(value))return false;
 const s=value;
 if(s.version!==1||typeof s.id!=='string'||!s.id||typeof s.name!=='string'||s.name.length>80||typeof s.locked!=='boolean'||!finite(s.updated))return false;
 if(!Array.isArray(s.palette)||s.palette.length<1||s.palette.length>8||!s.palette.every(swatch)||new Set(s.palette.map(p=>p.id)).size!==s.palette.length)return false;
 if(!Array.isArray(s.original)||s.original.length<1||s.original.length>8||!s.original.every(swatch)||new Set(s.original.map(p=>p.id)).size!==s.original.length)return false;
 if(!Array.isArray(s.candidates)||s.candidates.length>220||!s.candidates.every(c=>record(c)&&hex(c.hex)&&finite(c.count)&&c.count>0))return false;
 const source=s.source;
 if(!record(source)||!['image','colours'].includes(source.kind)||typeof source.title!=='string')return false;
 if(source.kind==='image'&&(typeof source.src!=='string'||!(/^data:image\/(png|jpeg|webp);base64,/.test(source.src)||/^\/images\/art-\d+\.jpg$/.test(source.src))))return false;
 if(source.kind==='colours'&&source.src!==undefined)return false;
 if(['artist','license'].some(k=>source[k]!==undefined&&typeof source[k]!=='string'))return false;
 if(source.url!==undefined&&(typeof source.url!=='string'||!/^https?:\/\//.test(source.url)))return false;
 if(source.seeds!==undefined&&(!Array.isArray(source.seeds)||source.seeds.length<1||source.seeds.length>3||!source.seeds.every(hex)))return false;
 const crop=source.crop;
 if(!record(crop)||!['x','y','w','h'].every(k=>finite(crop[k])&&crop[k]>=0&&crop[k]<=100)||crop.w<=0||crop.h<=0||crop.x+crop.w>100||crop.y+crop.h>100)return false;
 const tuning=s.tuning;
 if(!record(tuning)||!['Free','Analogous','Complementary','Split complementary','Triadic'].includes(tuning.harmony)||!['saturation','warmth','contrast'].every(k=>finite(tuning[k])&&Math.abs(tuning[k])<=100))return false;
 if(!record(s.sequences)||!record(s.matches))return false;
 const ids=new Set(s.palette.map(p=>p.id));
 for(const [key,q] of Object.entries(s.sequences)){
  if(!record(q)||!ids.has(key)||q.coreId!==key||![0,1,2].includes(q.anchor)||!finite(q.spread)||q.spread<.04||q.spread>.32||typeof q.review!=='boolean'||!Array.isArray(q.tones)||q.tones.length!==3)return false;
  if(!q.tones.every((t:unknown)=>record(t)&&hex(t.hex)&&origin(t.origin)&&typeof t.manual==='boolean'&&(t.coreId===undefined||ids.has(t.coreId))))return false;
  if(q.tones[q.anchor].hex!==s.palette.find(p=>p.id===key).hex)return false;
 }
 for(const [key,paint] of Object.entries(s.matches)){
  const [core,tone,...rest]=key.split(':');
  if(typeof paint!=='string'||!paint||!ids.has(core)||rest.length||(tone!==undefined&&(!/^[012]$/.test(tone)||!s.sequences[core])))return false;
 }
 return true;
}
export async function imageData(src:string){if(src.startsWith('data:'))return src;const response=await fetch(src);if(!response.ok)throw new Error('The source image could not be read.');const blob=await response.blob();if(!/^image\/(png|jpeg|webp)$/.test(blob.type))throw new Error('The source is not a supported image.');return await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(blob);});}
export async function exportBackup(scheme:Scheme){const source={...scheme.source};if(source.src)source.src=await imageData(source.src);download(new Blob([JSON.stringify({...scheme,source},null,2)],{type:'application/json'}),`${scheme.name}.json`);}
