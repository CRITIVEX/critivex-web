import {globalSearch} from '../../../lib/global-search';
export const dynamic='force-dynamic';
// Best-effort per-isolate protection; Cloudflare edge limits remain necessary for distributed abuse.
const clients=new Map<string,{count:number;reset:number}>();
const windowMs=60_000, limit=60, capacity=4096;
function allow(client:string){
 const now=Date.now();
 let bucket=clients.get(client);
 if(!bucket||bucket.reset<=now){
  if(clients.size>=capacity){
   for(const [key,value] of clients){if(value.reset<=now)clients.delete(key)}
   if(clients.size>=capacity&&!clients.has(client))return 60;
  }
  bucket={count:0,reset:now+windowMs};clients.set(client,bucket);
 }
 if(bucket.count>=limit)return Math.max(1,Math.ceil((bucket.reset-now)/1000));
 bucket.count++;return 0;
}
export async function GET(request:Request){
 const q=(new URL(request.url).searchParams.get('q')??'').trim().slice(0,100);
 if(q.length<3)return Response.json({items:[],failed:[]},{headers:{'Cache-Control':'no-store'}});
 const retry=allow(request.headers.get('cf-connecting-ip')??'unknown');
 if(retry)return Response.json({items:[],failed:['Search rate limit'],message:'Too many searches. Please try again shortly.'},{status:429,headers:{'Retry-After':String(retry),'Cache-Control':'no-store'}});
 try{const result=await globalSearch(q,'all','az',1);
 const items=['Games','Reviews','News'].flatMap(type=>result.items.filter(i=>i.type===type).sort((a,b)=>Number(b.title.toLowerCase()===q.toLowerCase())-Number(a.title.toLowerCase()===q.toLowerCase())).slice(0,type==='Games'?6:3).map(({title,url,type,date})=>({title,url,type,date})));
 return Response.json({items,failed:result.failed},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({items:[],failed:['Search']},{status:503})}
}
