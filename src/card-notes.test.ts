import {it,expect} from 'vitest';
import {cardCells} from './card-layout';
import {paintNotes} from './card-notes';
import {generatePalette,makeSequence} from './colour';
import {neutralTuning} from './types';
it('prints a shared paint once with all refs, while retaining distinct core and anchor paints',()=>{
 const palette=generatePalette(['#336699'],3,neutralTuning),cells=cardCells({palette,sequences:{c0:makeSequence(palette[0])},matches:{c0:'a','c0:1':'b','c0:0':'a',c1:'a'}} as any);
 const notes=paintNotes(cells,[]);expect(notes.map(n=>({id:n.paintId,refs:n.refs}))).toEqual([{id:'a',refs:['01C Core','01S Shadow','02C Core']},{id:'b',refs:['01C Midtone']}]);
});
it('combines the core and anchor label only for the same paint, and retains unknown paint ids',()=>{
 const palette=generatePalette(['#336699'],3,neutralTuning),notes=paintNotes(cardCells({palette,sequences:{c0:makeSequence(palette[0])},matches:{c0:'missing','c0:1':'missing'}} as any),[]);
 expect(notes).toEqual([{paintId:'missing',refs:['01C Core + Midtone'],paint:undefined}]);
});
