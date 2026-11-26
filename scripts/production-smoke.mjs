import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
const base=process.env.CRITIVEX_URL||'https://critivex-web.critivex.workers.dev';
const results=[];
async function check(path,validate){
 const start=performance.now();
 const response=await fetch(new URL(path,base),{signal:AbortSignal.timeout(20000)});
 const body=await response.text();
 const ms=Math.round(performance.now()-start);
 assert.equal(response.status,200,path);
 validate(body);
 results.push({path,ms,status:response.status});
}
const catalogue=body=>{assert.match(body,/Explore games/i);assert.doesNotMatch(body,/Catalogue query unavailable|Catalogue query:|Application error/i);assert.match(body,/Page\s*<!-- -->\s*\d+|Page \d+|games shown|games\\\\u0020shown/i)};
const search=body=>{const data=JSON.parse(body);assert.deepEqual(data.failed,[]);assert.ok(data.items.some(i=>i.type==='Games'&&/call of duty/i.test(i.title)))};
await check('/games',catalogue);
await check('/games',catalogue);
await check('/games?sort=new',catalogue);
await check('/games?q=Call+of+Duty',catalogue);
await check('/api/search?q=Call+of+Duty',search);
await check('/api/search?q=Call+of+Duty',search);
await check('/games/call-of-duty',body=>{assert.match(body,/Call of Duty/i);assert.doesNotMatch(body,/Unable to load game/i)});
await check('/api/search?q=a',body=>assert.deepEqual(JSON.parse(body).items,[]));
console.table(results);
console.log('Production smoke checks passed. Timings include network and rendering; repeated requests do not prove a cache hit.');
