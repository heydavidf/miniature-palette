import {download} from './storage';
import {panoramaCrop} from './framing';
import {cardCells} from './card-layout';
import {printChoices} from './print-pairs';
import type {CardCell} from './card-layout';
import type {Paint,Scheme} from './types';
export const pageSize={w:210,h:297,dpi:300};
const px=300/25.4;
type Page={canvas:HTMLCanvasElement;c:CanvasRenderingContext2D};
function page(w=210,h=297):Page{const canvas=document.createElement('canvas');canvas.width=Math.round(w*px);canvas.height=Math.round(h*px);const c=canvas.getContext('2d',{colorSpace:'srgb'})!;c.fillStyle='#ffffff';c.fillRect(0,0,canvas.width,canvas.height);c.scale(px,px);return {canvas,c};}
function text(c:CanvasRenderingContext2D,str:string,x:number,y:number,size=2.8,weight=400,colour='#262626'){c.fillStyle=colour;c.font=`${weight} ${size}px "Instrument Sans", sans-serif`;c.fillText(str,x,y);}
function wrap(c:CanvasRenderingContext2D,str:string,width:number,size=2.8,weight=400){c.font=`${weight} ${size}px "Instrument Sans", sans-serif`;const lines:string[]=[];let line='';for(const word of str.split(/\s+/)){if(c.measureText(line+(line?' ':'')+word).width<=width){line+=(line?' ':'')+word;continue;}if(line)lines.push(line);line='';for(const char of word){if(c.measureText(line+char).width>width){lines.push(line);line='';}line+=char;}}if(line)lines.push(line);return lines;}
function lines(c:CanvasRenderingContext2D,str:string,x:number,y:number,width:number,size=2.8){const all=wrap(c,str,width,size);all.forEach((l,i)=>text(c,l,x,y+i*size*1.35,size));return all.length*size*1.35;}
function header(c:CanvasRenderingContext2D,s:Scheme,subtitle?:string){text(c,'pigment',10,15,7,500);lines(c,s.name,10,21,277,3.5);if(subtitle)text(c,subtitle,10,31,3);}
async function fonts(){await Promise.all([document.fonts.load('400 24px "Instrument Sans"'),document.fonts.load('500 24px "Instrument Sans"')]);}
type PairLine={text:string;y:number;weight:number;size:number;colour:string;role:'name'|'detail'|'colour'};
export type PrintPair={cell:CardCell;x:number;y:number;labelX:number;labelWidth:number;height:number;lines:PairLine[]};
export type CardMetrics={square:number;imageY:number;imageHeight:number;gridY:number;nameLines:string[];creditLines:string[];pairs:PrintPair[];rowHeights:number[]};
/** Real adjacent labels determine the row height. Font and patch floors are never silently reduced. */
export function measureCard(c:CanvasRenderingContext2D,s:Scheme,paints:Paint[]):CardMetrics{
 const cells=cardCells(s),nameLines=wrap(c,s.name,190,3.5),imageY=22+nameLines.length*4.5;
 const imageHeight=190/(s.source.framing?.aspect||3.5),creditLines=wrap(c,[s.source.title,s.source.artist,s.source.license,s.source.url].filter(Boolean).join(' · '),190,2.7);
 const gridY=imageY+imageHeight+4+creditLines.length*3.5+5,columns=3,gap=6,width=(190-(columns-1)*gap)/columns;
 const labels=(cell:CardCell,labelWidth:number)=>{let y=0;const out:PairLine[]=[];
  const add=(str:string,role:PairLine['role'])=>{const size=role==='name'?3:2.6,weight=role==='name'?500:400,colour=role==='name'?'#262626':'#626262';for(const line of wrap(c,str,labelWidth,size,weight)){out.push({text:line,y:y+size*.85,weight,size,colour,role});y+=size*1.3;}};
  const choices=printChoices(s,cell,paints);
  choices.forEach((choice,i)=>{if(i)y+=2;
   if(choice.paint){add(choice.paint.name,'name');add(`${choice.paint.brand} · ${choice.paint.range}`,'detail');const code=choice.paint.code?`Code ${choice.paint.code}`:'';const detail=[choices.length>1?`${choice.label} paint`:'',code].filter(Boolean).join(' · ');if(detail)add(detail,'detail');}
   else{add(choice.paintId?'Selected paint unavailable':'No paint selected','name');if(choice.paintId)add(`Catalogue unavailable · ${choice.paintId}`,'detail');if(choices.length>1)add(`${choice.label} paint`,'detail');}
  });
  y+=2;add(`${cell.ref} · ${cell.role.replace('Core / ','Core/')} · ${cell.hex.toUpperCase()}`,'colour');
  return {lines:out,height:y};
 };
 const max=30,min=16;
 for(let square=Math.floor(max*2)/2;square>=min;square-=.5){
  const labelWidth=width-square-2.5;if(labelWidth<7)continue;
  const rows=Math.ceil(cells.length/columns),rowHeights=Array(rows).fill(square),pairs:PrintPair[]=[];
  cells.forEach((cell,i)=>{const row=Math.floor(i/columns),column=i%columns,copy=labels(cell,labelWidth);rowHeights[row]=Math.max(rowHeights[row],copy.height);const x=10+column*(width+gap);pairs.push({cell,x,y:row,labelX:x+square+2.5,labelWidth,height:copy.height,lines:copy.lines});});
  const bottom=gridY+rowHeights.reduce((n,h)=>n+h,0)+(rows-1)*4;
  if(bottom>277)continue;
  const tops:number[]=[];let y=gridY;rowHeights.forEach(h=>{tops.push(y);y+=h+4;});pairs.forEach(pair=>pair.y=tops[pair.y]);
  return {square,imageY,imageHeight,gridY,nameLines,creditLines,pairs,rowHeights};
 }
 throw new Error('This study cannot fit on one readable A4 side with full paint details. Your study is unchanged. Keep a JSON backup; this study needs an extra-page layout.');
}
export async function renderCard(s:Scheme,paints:Paint[]){
 await fonts();const p=page(),c=p.c,m=measureCard(c,s,paints);
 text(c,'pigment',10,15,7,500);
 m.nameLines.forEach((line,i)=>text(c,line,10,21+i*4.5,3.5));
 if(s.source.src){const image=new Image();image.src=s.source.src;await image.decode();const r=panoramaCrop(s.source,image.naturalWidth,image.naturalHeight);c.drawImage(image,image.naturalWidth*r.x/100,image.naturalHeight*r.y/100,image.naturalWidth*r.w/100,image.naturalHeight*r.h/100,10,m.imageY,190,m.imageHeight);}
 else{let x=10;const total=s.palette.reduce((n,p)=>n+p.weight,0);s.palette.forEach(p=>{const w=190*p.weight/total;c.fillStyle=p.hex;c.fillRect(x,m.imageY,w,m.imageHeight);x+=w;});}
 m.creditLines.forEach((line,i)=>text(c,line,10,m.imageY+m.imageHeight+4+i*3.5,2.7));
 m.pairs.forEach(pair=>{c.fillStyle=pair.cell.hex;c.fillRect(pair.x,pair.y,m.square,m.square);c.strokeStyle='#999999';c.lineWidth=.12;c.strokeRect(pair.x-.15,pair.y-.15,m.square+.3,m.square+.3);pair.lines.forEach(line=>text(c,line.text,pair.labelX,pair.y+line.y,line.size,line.weight,line.colour));});
 text(c,`Clear squares: ${m.square} mm at Actual size / 100%. C Core · S Shadow · M Midtone · H Highlight.`,10,286,2.6);
 text(c,'Digital paint matches are approximate. Compare a printed proof before painting.',10,291,2.6);
 return [p.canvas];
}
/** PNG metadata records intended sRGB and 300 pixels/inch; PDF supplies physical page sizing. */
export function printPng(bytes:Uint8Array){
 const crc=(data:Uint8Array)=>{let n=0xffffffff;for(const b of data){n^=b;for(let j=0;j<8;j++)n=(n>>>1)^((n&1)?0xedb88320:0);}return (n^0xffffffff)>>>0;};
 const chunk=(type:string,data:Uint8Array)=>{const out=new Uint8Array(data.length+12),view=new DataView(out.buffer);view.setUint32(0,data.length);out.set(new TextEncoder().encode(type),4);out.set(data,8);view.setUint32(data.length+8,crc(out.subarray(4,data.length+8)));return out;};
 const density=new Uint8Array(9),dv=new DataView(density.buffer);dv.setUint32(0,11811);dv.setUint32(4,11811);density[8]=1;
 const gamma=new Uint8Array(4);new DataView(gamma.buffer).setUint32(0,45455);
 const chunks=[bytes.subarray(0,8)];let at=8;
 while(at<bytes.length){const length=new DataView(bytes.buffer,bytes.byteOffset+at,4).getUint32(0),type=new TextDecoder().decode(bytes.subarray(at+4,at+8));if(!['pHYs','sRGB','gAMA','cHRM','iCCP','cICP'].includes(type))chunks.push(bytes.subarray(at,at+length+12));if(type==='IHDR')chunks.push(chunk('sRGB',new Uint8Array([1])),chunk('gAMA',gamma),chunk('pHYs',density));at+=length+12;}
 const result=new Uint8Array(chunks.reduce((n,c)=>n+c.length,0));let offset=0;chunks.forEach(c=>{result.set(c,offset);offset+=c.length;});return result;
}
async function png(canvas:HTMLCanvasElement){const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Unable to create the card')),'image/png'));return new Blob([printPng(new Uint8Array(await blob.arrayBuffer())).buffer as ArrayBuffer],{type:'image/png'});}
export async function exportCard(s:Scheme,paints:Paint[]){const pages=await renderCard(s,paints);const canvas=document.createElement('canvas');canvas.width=pages[0].width;canvas.height=pages.reduce((n,p)=>n+p.height,0);const c=canvas.getContext('2d',{colorSpace:'srgb'})!;let y=0;pages.forEach(p=>{c.drawImage(p,0,y);y+=p.height;});download(await png(canvas),`${s.name}.png`);}
async function pdf(pages:HTMLCanvasElement[],name:string,portrait=true){const {jsPDF}=await import('jspdf');const doc=new jsPDF({orientation:portrait?'portrait':'landscape',unit:'mm',format:'a4',compress:true});pages.forEach((canvas,i)=>{if(i)doc.addPage('a4',portrait?'portrait':'landscape');doc.addImage(canvas,'PNG',0,0,portrait?210:297,portrait?297:210,undefined,'FAST');});doc.setProperties({title:name,creator:'Pigment'});download(doc.output('blob'),`${name}.pdf`);}
export async function exportPrintCard(s:Scheme,paints:Paint[]){await pdf(await renderCard(s,paints),`${s.name} - print card`);}
export async function renderProof(s:Scheme){await fonts();const study=cardCells(s).map(c=>({hex:c.hex,label:`${c.ref} ${c.role}`}));
 const tests=[['#ffffff','Paper / white'],['#e6e6e6','Light neutral'],['#808080','Mid neutral'],['#202020','Dark neutral'],['#ff0000','Saturated red'],['#00ff00','Saturated green'],['#0000ff','Saturated blue'],['#ffff00','Saturated yellow']].map(([hex,label])=>({hex,label}));
 const patches=[...study,...tests],pages:Page[]=[];
 for(let n=0;n<patches.length;n+=24){const p=page(297,210);pages.push(p);header(p.c,s,'Printer proof · colour comparison, not a calibration profile');text(p.c,'Print in colour at Actual size / 100%. Measure this line: 50 mm.',10,39,3);p.c.strokeStyle='#262626';p.c.lineWidth=.2;p.c.beginPath();p.c.moveTo(10,45);p.c.lineTo(60,45);p.c.moveTo(10,43);p.c.lineTo(10,47);p.c.moveTo(60,43);p.c.lineTo(60,47);p.c.stroke();text(p.c,'Printer / ink: __________________  Paper / media: __________________  Quality: __________',75,45,2.9);text(p.c,'Light / date: __________________  Measured line: ______ mm  Overall: usable / revise',10,53,2.9);
 patches.slice(n,n+24).forEach((item,i)=>{const x=14.5+i%8*34,y=61+Math.floor(i/8)*44;p.c.fillStyle=item.hex;p.c.fillRect(x,y,30,30);p.c.strokeStyle='#999999';p.c.lineWidth=.12;p.c.strokeRect(x-.15,y-.15,30.3,30.3);text(p.c,`${n+i+1}. ${item.label}`,x,y+33.5,2.5);text(p.c,item.hex.toUpperCase(),x,y+37,2.5);text(p.c,'Result: __________________',x,y+41,2.5);});
 text(p.c,'Result key: same / lighter / darker / hue shift / unusable. Compare a painted part in consistent light.',10,198,2.6);text(p.c,`${pages.length}`,282,198,2.5);
 }return pages.map(p=>p.canvas);
}
export async function exportProof(s:Scheme){await pdf(await renderProof(s),`${s.name} - printer proof`,false);}
