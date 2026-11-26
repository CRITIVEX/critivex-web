import {createClient} from '@supabase/supabase-js';
export type SearchItem={title:string;description:string;url:string;type:string;date:string};
export async function globalSearch(query:string,type:string,sort:string,page:number){
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if(!url||!key)return {items:[] as SearchItem[],total:0,pages:1,hasMore:false,failed:['Search configuration']};
const c=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}});
const term=query.trim().replace(/[^\p{L}\p{N} .'-]/gu,' ').trim();
const size=24,from=(page-1)*size;
const sections=type==='all'?['games','reviews','news']:[type];
const results=await Promise.allSettled(sections.map(async section=>{
if(section==='games'){
if(term.length<3)return {hasMore:false,items:[] as SearchItem[]};
const {data,error}=await c.rpc('browse_games',{search_term:term,sort_mode:sort==='az'?'az':'new',page_offset:from,page_size:size+1});
if(error){console.error('Game search failed',error.code,error.message);throw new Error('Game search failed')}
return {hasMore:(data?.length??0)>size,items:(data??[]).slice(0,size).map((g:{title:string;description:string|null;slug:string;release_date:string|null})=>({title:g.title,description:g.description??'',url:'/games/'+g.slug,type:'Games',date:g.release_date??''}))};
}
let q=c.from('articles').select('slug,title,summary,published_at').eq('kind',section==='reviews'?'review':'news').lte('published_at',new Date().toISOString());
if(term)q=q.or('title.ilike.%'+term+'%,summary.ilike.%'+term+'%');
const {data,error}=await q.order(sort==='az'?'title':'published_at',{ascending:sort==='az'}).order('slug').range(from,from+size);
if(error){console.error('Article search failed',error.code,error.message);throw new Error('Article search failed')}
return {hasMore:(data?.length??0)>size,items:(data??[]).slice(0,size).map(a=>({title:a.title,description:a.summary??'',url:'/'+section+'/'+a.slug,type:section==='reviews'?'Reviews':'News',date:a.published_at??''}))};
}));
const ok=results.flatMap(r=>r.status==='fulfilled'?[r.value]:[]);const items=ok.flatMap(r=>r.items);const hasMore=ok.some(r=>r.hasMore);const failed=sections.filter((_,i)=>results[i].status==='rejected');return {items,total:items.length,pages:page+(hasMore?1:0),hasMore,failed};
}
