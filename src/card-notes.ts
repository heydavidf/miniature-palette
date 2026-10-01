import type {Paint} from './types';
import type {CardCell} from './card-layout';
export type PaintNote={paintId:string;refs:string[];paint?:Paint};
export function paintNotes(cells:CardCell[],paints:Paint[]):PaintNote[]{
 const notes=new Map<string,PaintNote>();
 cells.forEach(cell=>cell.associations.forEach(a=>{let note=notes.get(a.paintId);if(!note){note={paintId:a.paintId,refs:[],paint:paints.find(p=>p.id===a.paintId)};notes.set(a.paintId,note);}note.refs.push(`${cell.ref} ${a.label}`);}));
 return [...notes.values()];
}
