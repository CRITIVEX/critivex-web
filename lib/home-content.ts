import {createClient} from '@supabase/supabase-js';
export type HomeGame={slug:string;title:string;release_date:string|null;cover_image_id:string|null;screenshot_image_ids?:string[];critic_count?:number;player_count?:number;recent_count?:number};
export type HomeArticle={slug:string;title:string;summary:string;published_at:string;score:number|null;category:string|null};
export async function homeContent(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 const empty={news:[] as HomeArticle[],reviews:[] as HomeArticle[],recent:[] as HomeGame[],upcoming:[] as HomeGame[],trending:[] as HomeGame[],unavailable:['news','reviews','recent','upcoming','trending']};
 if(!url||!key)return empty;
 const c=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}});
 const now=new Date().toISOString(),today=now.slice(0,10);
 const articles=(kind:string)=>c.from('articles').select('slug,title,summary,published_at,score,category').eq('kind',kind).lte('published_at',now).order('published_at',{ascending:false}).limit(5);
 const fields='slug,title,release_date,cover_image_id,screenshot_image_ids';
 const results=await Promise.allSettled([articles('news'),articles('review'),c.from('games').select(fields).lte('release_date',today).not('cover_image_id','is',null).order('release_date',{ascending:false}).order('slug').limit(8),c.from('games').select(fields).gt('release_date',today).order('release_date').order('slug').limit(6),c.rpc('popular_games',{recent:true}).limit(5)]);
 const unavailable:string[]=[];
 function read<T>(i:number,name:string):T[]{const r=results[i];if(r.status==='rejected'||r.value.error){unavailable.push(name);return []}return (r.value.data??[]) as T[]}
 return {news:read<HomeArticle>(0,'news'),reviews:read<HomeArticle>(1,'reviews'),recent:read<HomeGame>(2,'recent'),upcoming:read<HomeGame>(3,'upcoming'),trending:read<HomeGame>(4,'trending'),unavailable};
}
