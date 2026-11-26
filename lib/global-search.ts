import {createClient} from '@supabase/supabase-js';
export type SearchItem={title:string;description:string;url:string;type:string;date:string};
export async function globalSearch(query:string,type:string,sort:string,page:number){
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if(!url||!key)return {items:[] as SearchItem[],total:0};
const c=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}});
const term=query.trim().replace(/[^\p{L}\p{N} .'-]/gu,' ').trim();
const size=24,from=(page-1)*size;
const sections=type==='all'?['games','reviews','news']:[type];
const results=await Promise.all(sections.map(async section=>{
if(section==='games'){
let q=c.from('games').select('slug,title,description,release_date',{count:'exact'});
if(term)q=q.or('title.ilike.%'+term+'%,developer.ilike.%'+term+'%,publisher.ilike.%'+term+'%');
const {data,error,count}=await q.order(sort==='az'?'title':'release_date',{ascending:sort==='az',nullsFirst:false}).order('slug').range(from,from+size-1);
if(error)throw new Error('Game search failed');
return {total:count??0,items:(data??[]).map(g=>({title:g.title,description:g.description??'',url:'/games/'+g.slug,type:'Games',date:g.release_date??''}))};
}
let q=c.from('articles').select('slug,title,summary,published_at',{count:'exact'}).eq('kind',section==='reviews'?'review':'news').lte('published_at',new Date().toISOString());
if(term)q=q.or('title.ilike.%'+term+'%,summary.ilike.%'+term+'%');
const {data,error,count}=await q.order(sort==='az'?'title':'published_at',{ascending:sort==='az'}).order('slug').range(from,from+size-1);
if(error)throw new Error('Article search failed');
return {total:count??0,items:(data??[]).map(a=>({title:a.title,description:a.summary??'',url:'/'+section+'/'+a.slug,type:section==='reviews'?'Reviews':'News',date:a.published_at??''}))};
}));
return {items:results.flatMap(r=>r.items),total:results.reduce((n,r)=>n+r.total,0),pages:Math.max(1,...results.map(r=>Math.ceil(r.total/size)))};
}
