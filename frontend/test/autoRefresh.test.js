import test from 'node:test';
import assert from 'node:assert/strict';
import { startAutoRefresh } from '../src/utils/autoRefresh.js';
function host() {
 const events = new Map();
 const window = { navigator:{onLine:true}, setInterval:fn=>{window.tick=fn;return 1;},clearInterval:()=>{window.cleared=true;},addEventListener:(k,fn)=>events.set(k,fn),removeEventListener:k=>events.delete(k)};
 const document = {visibilityState:'visible',editing:false,querySelector:()=>document.editing,activeElement:{matches:()=>false},addEventListener:(k,fn)=>events.set(k,fn),removeEventListener:k=>events.delete(k)};
 return {window,document,events};
}
test('refresh pauses for hidden/offline tabs and active edits, and resumes on focus',async()=>{
 const h=host();let calls=0;const stop=startAutoRefresh(async()=>{calls++;},h);
 await h.window.tick();assert.equal(calls,1);
 h.document.visibilityState='hidden';await h.window.tick();
 h.document.visibilityState='visible';h.window.navigator.onLine=false;await h.window.tick();
 h.window.navigator.onLine=true;h.document.editing=true;await h.window.tick();assert.equal(calls,1);
 h.document.editing=false;await h.events.get('focus')();assert.equal(calls,2);
 stop();assert.equal(h.events.size,0);assert.ok(h.window.cleared);await h.window.tick();assert.equal(calls,2);
});
test('slow requests never overlap and failures allow subsequent refreshes',async()=>{
 const h=host();let release,calls=0,errors=0;
 const stop=startAutoRefresh(async()=>{calls++;if(calls===1)await new Promise(r=>{release=r;});else throw Error('offline');},{...h,onError:()=>errors++});
 const pending=h.window.tick();await h.window.tick();assert.equal(calls,1);release();await pending;
 await h.window.tick();await h.window.tick();assert.equal(calls,3);assert.equal(errors,2);stop();
});
