import {useState} from 'react';
import {oklch,adjustedColour,readable} from './colour';
import type {Swatch} from './types';

export default function ColourEditor({active,palette,disabled,onApply}:{active:Swatch;palette:Swatch[];disabled:boolean;onApply:(hex:string)=>void}){
 const [open,setOpen]=useState(false);
 const original=oklch(active.hex)!;
 const [draft,setDraft]=useState({h:original.h||0,c:original.c,l:original.l});
 const [hexInput,setHexInput]=useState(active.hex);
 const hex=adjustedColour(draft);
 const valid=/^#[0-9a-f]{6}$/i.test(hexInput);
 function change(key:'h'|'c'|'l',value:number){const next={...draft,[key]:value};setDraft(next);setHexInput(adjustedColour(next));}
 function fromHex(value:string){setHexInput(value);if(/^#[0-9a-f]{6}$/i.test(value)){const c=oklch(value)!;setDraft({h:c.h||0,c:c.c,l:c.l});}}
 return <div className="colour-adjustment">
 <button className="quiet" disabled={disabled} aria-expanded={open&&!disabled} onClick={()=>setOpen(!open)}>Adjust colour</button>
 {disabled&&<span className="muted">Use Edit palette to change a core colour.</span>}
 {open&&!disabled&&<div className="colour-adjust-panel">
 <h3>Adjust this colour</h3><p className="muted">Change its hue while keeping its lightness and vividness. The other core colours stay as they are.</p>
 <div className="adjust-preview" aria-label="Palette preview">{palette.map(p=><span key={p.id} style={{background:p.id===active.id?hex:p.hex,color:readable(p.id===active.id?hex:p.hex)}}>{p.id===active.id?'Preview':''}</span>)}</div>
 <div className="adjust-comparison"><span>Before <i style={{background:active.hex}}/>{active.hex.toUpperCase()}</span><span>After <i style={{background:hex}}/>{hex.toUpperCase()}</span></div>
 <label>Hue <input aria-label="Selected colour hue" type="range" min="0" max="360" step="1" value={draft.h} onChange={e=>change('h',+e.target.value)}/><output>{Math.round(draft.h)}°</output></label>
 <p className="hue-guide">Red 25° · Yellow 95° · Green 145° · Blue 260° · Pink 350°</p>
 <label>Vividness <input aria-label="Selected colour vividness" type="range" min="0" max="0.4" step="0.005" value={draft.c} onChange={e=>change('c',+e.target.value)}/><output>{Math.round(draft.c*250)}%</output></label>
 <label>Lightness <input aria-label="Selected colour lightness" type="range" min="0.05" max="0.95" step="0.01" value={draft.l} onChange={e=>change('l',+e.target.value)}/><output>{Math.round(draft.l*100)}%</output></label>
 <div className="adjust-exact"><input type="color" aria-label="Choose exact colour" value={hex} onChange={e=>fromHex(e.target.value)}/><label>Hex colour<input aria-label="Hex colour" value={hexInput} spellCheck={false} maxLength={7} aria-invalid={!valid} onChange={e=>fromHex(e.target.value)}/></label></div>
 {!valid&&<p role="alert">Enter # followed by six letters or numbers, such as #C43D43.</p>}
 <p className="muted">Applied colours stay fixed during whole-palette tuning. Unlock the swatch to include it again. Some vivid colours need a small adjustment to display on screen.</p>
 <div className="row"><button className="primary" disabled={!valid||hex.toLowerCase()===active.hex.toLowerCase()} onClick={()=>{onApply(hex);setOpen(false);}}>Apply colour</button><button onClick={()=>{setDraft({h:original.h||0,c:original.c,l:original.l});setHexInput(active.hex);setOpen(false);}}>Cancel</button></div>
 </div>}
 </div>;
}
