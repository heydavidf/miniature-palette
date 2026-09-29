import type {Scheme} from './types';

/** Resolve only colours that still exist, never a stale colour cached by the UI. */
export function targetColour(scheme:Scheme,key:string):string|undefined {
 const [id,tone]=key.split(':');
 if(tone===undefined)return scheme.palette.find(p=>p.id===id)?.hex;
 if(!/^[012]$/.test(tone)||!scheme.palette.some(p=>p.id===id))return undefined;
 return scheme.sequences[id]?.tones[Number(tone)]?.hex;
}

export function withoutSequence(scheme:Scheme,id:string):Scheme {
 const sequences={...scheme.sequences};delete sequences[id];
 const matches={...scheme.matches};
 for(let i=0;i<3;i++)delete matches[`${id}:${i}`];
 return {...scheme,sequences,matches};
}

export function copySchemeName(name:string):string { return `${name.slice(0,75).trimEnd()||'Untitled'} copy`; }
