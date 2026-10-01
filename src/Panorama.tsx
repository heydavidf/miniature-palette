import {useEffect,useRef,useState} from 'react';
import {defaultFraming,moveFraming,panoramaCrop} from './framing';
import type {Framing} from './framing';
import type {Source} from './types';
type Props={source:Source;sampling:boolean;disabled:boolean;onChange:(f:Framing)=>void;onSample:(x:number,y:number)=>void};
export default function Panorama({source,sampling,disabled,onChange,onSample}:Props){
 const [size,setSize]=useState({w:0,h:0}),[preview,setPreview]=useState<Framing|null>(null),[box,setBox]=useState({w:1,h:1});
 const wrap=useRef<HTMLDivElement>(null),frame=useRef<HTMLDivElement>(null);
 const gesture=useRef<{id:number;x:number;y:number;source:Source;next:Framing;moved:boolean}|null>(null);
 useEffect(()=>{let cancelled=false;setSize({w:0,h:0});setPreview(null);gesture.current=null;const image=new Image();image.src=source.src||'';image.decode().then(()=>{if(!cancelled)setSize({w:image.naturalWidth,h:image.naturalHeight});}).catch(()=>{});return()=>{cancelled=true;};},[source.src]);
 useEffect(()=>{setPreview(null);},[source.framing,source.crop]);
 useEffect(()=>{const el=wrap.current;if(!el)return;const observer=new ResizeObserver(([r])=>setBox({w:r.contentRect.width,h:r.contentRect.height}));observer.observe(el);return()=>observer.disconnect();},[]);
 const f=preview||source.framing||defaultFraming,r=panoramaCrop(source,size.w||1,size.h||1,f);
 const fw=Math.min(box.w,box.h*f.aspect),fh=fw/f.aspect;
 const movableX=source.crop.w-r.w>1e-8,movableY=source.crop.h-r.h>1e-8;
 function finish(commit:boolean){const g=gesture.current;gesture.current=null;if(g&&commit&&g.moved)onChange(g.next);setPreview(null);}
 function nudge(dx:number,dy:number){if(disabled||sampling)return;const next={...f,x:Math.max(0,Math.min(1,f.x+(movableX?dx:0))),y:Math.max(0,Math.min(1,f.y+(movableY?dy:0)))};if(next.x!==f.x||next.y!==f.y)onChange(next);}
 return <div className="panorama-wrap" ref={wrap}>
 <div ref={frame} className={`panorama-frame ${sampling?'sampling':''}`} style={{width:fw,height:fh,touchAction:sampling?'auto':'none'}} tabIndex={disabled?-1:0} role="group" aria-label={sampling?'Sample a colour from the panorama':'Image panorama. Drag to frame; arrow keys move the image, Shift moves further.'}
 onKeyDown={e=>{const directions:Record<string,[number,number]>={ArrowLeft:[.02,0],ArrowRight:[-.02,0],ArrowUp:[0,.02],ArrowDown:[0,-.02]};if(directions[e.key]&&!sampling){e.preventDefault();const [x,y]=directions[e.key];nudge(x*(e.shiftKey?5:1),y*(e.shiftKey?5:1));}}}
 onPointerDown={e=>{if(disabled||!size.w||sampling||e.button!==0)return;e.currentTarget.setPointerCapture(e.pointerId);gesture.current={id:e.pointerId,x:e.clientX,y:e.clientY,source:{...source,framing:f},next:f,moved:false};}}
 onPointerMove={e=>{const g=gesture.current;if(!g||g.id!==e.pointerId)return;const b=e.currentTarget.getBoundingClientRect();g.next=moveFraming(g.source,size.w,size.h,e.clientX-g.x,e.clientY-g.y,b.width,b.height);g.moved=Math.hypot(e.clientX-g.x,e.clientY-g.y)>3;setPreview(g.next);}}
 onPointerUp={()=>finish(true)} onPointerCancel={()=>finish(false)} onLostPointerCapture={()=>finish(false)}
 onClick={e=>{if(!sampling||disabled)return;const b=e.currentTarget.getBoundingClientRect();onSample(r.x+(e.clientX-b.left)/b.width*r.w,r.y+(e.clientY-b.top)/b.height*r.h);}}>
 <img src={source.src} alt={source.title} draggable={false} style={{width:`${10000/r.w}%`,height:`${10000/r.h}%`,left:`${-r.x/r.w*100}%`,top:`${-r.y/r.h*100}%`}}/>
 </div>
 {!sampling&&!disabled&&<div className="framing-controls" aria-label="Panorama framing"><span>Drag to frame</span><button aria-label="Move image left" disabled={!movableX||f.x===1} onClick={()=>nudge(.1,0)}>←</button><button aria-label="Move image right" disabled={!movableX||f.x===0} onClick={()=>nudge(-.1,0)}>→</button><button aria-label="Move image up" disabled={!movableY||f.y===1} onClick={()=>nudge(0,.1)}>↑</button><button aria-label="Move image down" disabled={!movableY||f.y===0} onClick={()=>nudge(0,-.1)}>↓</button><button onClick={()=>onChange({...f,x:.5,y:.5})} disabled={f.x===.5&&f.y===.5}>Centre</button></div>}
 </div>;
}
