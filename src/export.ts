import {readable,colourName} from './colour';
import {download} from './storage';
import type {Paint,Scheme} from './types';
export async function exportCard(s:Scheme,paints:Paint[]){
 const seqs=Object.values(s.sequences);const width=1600,height=seqs.length?1540:1080;
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const c=canvas.getContext('2d')!;
 c.fillStyle='#f5f4ef';c.fillRect(0,0,width,height);c.fillStyle='#25352e';c.font='500 52px "DM Sans", sans-serif';c.fillText(s.name.slice(0,48),64,94);
 c.font='24px "DM Sans", sans-serif';c.fillStyle='#647068';c.fillText('MINIATURE PALETTE  /  PAINTING REFERENCE',64,140);
 if(s.source.src){const img=new Image();img.src=s.source.src;await img.decode();const crop=s.source.crop;const sx=img.width*crop.x/100,sy=img.height*crop.y/100,sw=img.width*crop.w/100,sh=img.height*crop.h/100;const r=Math.min(1472/sw,470/sh);c.drawImage(img,sx,sy,sw,sh,64+(1472-sw*r)/2,184+(470-sh*r)/2,sw*r,sh*r);}else{let x=64;const total=s.palette.reduce((a,b)=>a+b.weight,0)||1;s.palette.forEach(p=>{const w=1472*p.weight/total;c.fillStyle=p.hex;c.fillRect(x,184,w,470);x+=w;});}
 c.fillStyle='#647068';c.font='20px "DM Sans", sans-serif';c.fillText(`${s.source.title}${s.source.artist?' — '+s.source.artist:''}${s.source.license?' · '+s.source.license:''}`.slice(0,130),64,687);
 const gap=14,w=(1472-gap*(s.palette.length-1))/s.palette.length;
 const label=(text:string,x:number,y:number,max:number)=>{const words=text.split(' ');let line='',row=0;for(const word of words){if(c.measureText(line+word).width>max&&line){c.fillText(line,x,y+row*24);line='';row++;if(row===2){let rest=words.slice(words.indexOf(word)).join(' ');while(c.measureText(rest+'…').width>max&&rest.length)rest=rest.slice(0,-1);c.fillText(rest+'…',x,y+row*24);return;}}line+=word+' ';}c.fillText(line,x,y+row*24);};
 s.palette.forEach((p,i)=>{const x=64+i*(w+gap);c.fillStyle=p.hex;c.fillRect(x,724,w,116);c.fillStyle=readable(p.hex);c.font='22px "DM Sans", sans-serif';c.fillText(p.hex.toUpperCase(),x+14,818);c.fillStyle='#25352e';c.font='500 22px "DM Sans", sans-serif';c.fillText(colourName(p.hex),x,876);const paint=paints.find(v=>v.id===s.matches[p.id]);c.font='19px "DM Sans", sans-serif';label(paint?`${paint.brand} · ${paint.name}${paint.code?' / '+paint.code:''}`:'No paint selected',x,912,w);
 const seq=s.sequences[p.id];if(seq){seq.tones.forEach((t,j)=>{const y=1020+j*136;c.fillStyle=t.hex;c.fillRect(x,y,w,55);c.fillStyle=readable(t.hex);c.font='16px "DM Sans", sans-serif';c.fillText(['Shadow','Midtone','Highlight'][j],x+8,y+21);c.fillText(t.hex.toUpperCase(),x+8,y+43);c.fillStyle='#25352e';const matched=paints.find(v=>v.id===s.matches[`${p.id}:${j}`]);label(matched?`${matched.brand} · ${matched.name}${matched.code?' / '+matched.code:''}`:'No paint selected',x,y+80,w);});}});
 c.fillStyle='#647068';c.font='18px "DM Sans", sans-serif';c.fillText('Paint matches are approximate. Screen colours and painted results may differ.',64,height-28);
 await new Promise<void>((resolve,reject)=>canvas.toBlob(blob=>{if(!blob){reject(new Error('Unable to create the card'));return;}download(blob,`${s.name}.png`);resolve();},'image/png'));
}
