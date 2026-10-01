import type {Scheme} from './types';
export const roles=['Shadow','Midtone','Highlight'];
export type CardCell={column:number;offset:number;hex:string;role:string;ref:string;associations:{label:string;paintId:string}[]};
export function cardCells(s:Scheme):CardCell[]{
 return s.palette.flatMap((p,column)=>{
  const seq=s.sequences[p.id],number=String(column+1).padStart(2,'0');
  const associations:{label:string;paintId:string}[]=[];
  if(s.matches[p.id])associations.push({label:'Core',paintId:s.matches[p.id]});
  if(seq&&s.matches[`${p.id}:${seq.anchor}`]){
   const id=s.matches[`${p.id}:${seq.anchor}`],same=associations.find(a=>a.paintId===id);
   if(same)same.label+=` + ${roles[seq.anchor]}`;else associations.push({label:roles[seq.anchor],paintId:id});
  }
  const core:CardCell={column,offset:0,hex:p.hex,role:seq?`Core / ${roles[seq.anchor]}`:'Core',ref:`${number}C`,associations};
  return [core,...(seq?seq.tones.flatMap((t,i)=>i===seq.anchor?[]:[{column,offset:i-seq.anchor,hex:t.hex,role:roles[i],ref:`${number}${['S','M','H'][i]}`,associations:s.matches[`${p.id}:${i}`]?[{label:roles[i],paintId:s.matches[`${p.id}:${i}`]}]:[]}]):[])];
 });
}
