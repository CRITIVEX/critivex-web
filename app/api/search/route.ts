import {globalSearch} from '../../../lib/global-search';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const q=(new URL(request.url).searchParams.get('q')??'').trim().slice(0,100);
 if(q.length<2)return Response.json({items:[],failed:[]});
 try{const result=await globalSearch(q,'all','az',1);
 const items=['Games','Reviews','News'].flatMap(type=>result.items.filter(i=>i.type===type).sort((a,b)=>Number(b.title.toLowerCase()===q.toLowerCase())-Number(a.title.toLowerCase()===q.toLowerCase())).slice(0,type==='Games'?6:3).map(({title,url,type,date})=>({title,url,type,date})));
 return Response.json({items,failed:result.failed},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({items:[],failed:['Search']},{status:503})}
}
