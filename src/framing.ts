import type {Source} from './types';
export type Framing = {x:number;y:number;aspect:number};
export const defaultFraming:Framing={x:.5,y:.5,aspect:3.5};
export const clamp=(n:number)=>Math.max(0,Math.min(1,n));
/** Percentages of the original image, restricted to the extraction crop. */
export function panoramaCrop(source:Source,width:number,height:number,framing=source.framing||defaultFraming){
 const base=source.crop;const ratio=width*base.w/(height*base.h);
 const w=ratio>framing.aspect?base.w*framing.aspect/ratio:base.w;
 const h=ratio>framing.aspect?base.h:base.h*ratio/framing.aspect;
 return {x:base.x+(base.w-w)*clamp(framing.x),y:base.y+(base.h-h)*clamp(framing.y),w,h};
}
export function moveFraming(source:Source,width:number,height:number,dx:number,dy:number,frameWidth:number,frameHeight:number){
 const f=source.framing||defaultFraming,r=panoramaCrop(source,width,height);
 const rx=source.crop.w-r.w,ry=source.crop.h-r.h;
 return {...f,x:rx>1e-8?clamp(f.x-dx/frameWidth*r.w/rx):f.x,y:ry>1e-8?clamp(f.y-dy/frameHeight*r.h/ry):f.y};
}
