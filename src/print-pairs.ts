import {roles} from './card-layout';
import type {CardCell} from './card-layout';
import type {Paint,Scheme} from './types';
export type PrintChoice={label:string;paintId?:string;paint?:Paint};
/** Include missing assignments too; a core and its anchor can deliberately choose different bottles. */
export function printChoices(s:Scheme,cell:CardCell,paints:Paint[]):PrintChoice[]{
 const id=s.palette[cell.column].id,seq=s.sequences[id];
 const raw=cell.offset===0?[{label:'Core',paintId:s.matches[id]},...(seq?[{label:roles[seq.anchor],paintId:s.matches[`${id}:${seq.anchor}`]}]:[])]:[{label:cell.role,paintId:s.matches[`${id}:${roles.indexOf(cell.role)}`]}];
 const result:PrintChoice[]=[];
 for(const choice of raw){const same=result.find(p=>p.paintId===choice.paintId);if(same)same.label+=` + ${choice.label}`;else result.push({...choice,paint:paints.find(p=>p.id===choice.paintId)});}
 return result;
}
