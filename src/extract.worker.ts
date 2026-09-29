import {extractCandidates} from './colour';
self.onmessage=(event:MessageEvent<{id:number;pixels:Uint8ClampedArray}>)=>{
 try{self.postMessage({id:event.data.id,candidates:extractCandidates(event.data.pixels)});}catch{self.postMessage({id:event.data.id,error:'Could not read colours from this image.'});}
};
