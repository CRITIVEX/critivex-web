import Link from 'next/link';
import {createClient} from '@supabase/supabase-js';
import type {Metadata} from 'next';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Game release calendar',description:'Explore upcoming and recently released games.'};
export default async function Releases({searchParams}:{searchParams:Promise<{month?:string;platform?:string;page?:string}>}){
const params=await searchParams;const now=new Date().toISOString().slice(0,10);const month=/^\d{4}-(0[1-9]|1[0-2])$/.test(params.month??'')?params.month!:now.slice(0,7);
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const platform=(params.platform??'').trim().slice(0,100);
const end=new Date(month+'-01T00:00:00Z');end.setUTCMonth(end.getUTCMonth()+1);
const page=Math.min(10000,Math.max(1,Math.floor(Number((params as {page?:string}).page)||1))),size=48;
let filtered:{slug:string;title:string;releaseDate:string;platforms:string[];coverImageId:string|null}[]=[],failed=false,more=false;
try{if(!url||!key)throw new Error('Missing database configuration');
const c=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}});
let q=c.from('games').select('slug,title,release_date,platforms,cover_image_id').gte('release_date',month+'-01').lt('release_date',end.toISOString().slice(0,10));
if(platform)q=q.contains('platforms',[platform]);
const {data,error}=await q.order('release_date').order('slug').range((page-1)*size,page*size);
if(error)throw error;
more=(data?.length??0)>size;filtered=(data??[]).slice(0,size).map(g=>({slug:g.slug,title:g.title,releaseDate:g.release_date,platforms:g.platforms??[],coverImageId:g.cover_image_id}));
}catch(error){console.error('Release calendar query failed',error);failed=true}
const shift=(n:number)=>{const d=new Date(month+'-01T00:00:00Z');d.setUTCMonth(d.getUTCMonth()+n);return d.toISOString().slice(0,7)};
const href=(m:string)=>'/releases?'+new URLSearchParams({month:m,...(platform?{platform}:{})}).toString();
return <><span className="eyebrow">CRITIVEX RELEASE TRACKER</span><h1>Game release calendar</h1><p>Explore known release dates. Publisher schedules may change.</p><form className="filters"><label>Month<input type="month" name="month" defaultValue={month}/></label><label>Platform<input name="platform" defaultValue={platform} placeholder="All platforms"/></label><button type="submit">Apply filters</button></form><div className="score-row"><Link href={href(shift(-1))}>Previous month</Link><h2>{new Date(month+'-01T00:00:00Z').toLocaleDateString('en-AU',{month:'long',year:'numeric',timeZone:'UTC'})}</h2><Link href={href(shift(1))}>Next month</Link></div><p>{failed?"Release calendar temporarily unavailable.":`${filtered.length} releases on this page`}</p><div className="game-grid">{filtered.map(g=>{const days=Math.round((Date.parse(g.releaseDate)-Date.parse(now))/86400000);return <Link className="tile game-card" key={g.slug} href={'/games/'+g.slug}><div className="game-art">{g.coverImageId&&/^[a-zA-Z0-9_]+$/.test(g.coverImageId)?<img src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${g.coverImageId}.jpg`} alt="" loading="lazy" style={{width:'100%',height:'100%',objectFit:'contain'}}/>:g.title.slice(0,2).toUpperCase()}</div><div className="game-copy"><span className="eyebrow">{g.releaseDate}</span><h3>{g.title}</h3><p>{g.platforms.join(' · ')}</p><p>{days>0?`In ${days} days`:days===0?'Releases today':'Released'}</p></div></Link>})}</div>{!failed&&!filtered.length&&<p>No known releases match this month and platform in the current catalogue.</p>}{!failed&&<div className="score-row">{page>1&&<Link href={href(month)+'&page='+(page-1)}>Previous page</Link>}{more&&<Link href={href(month)+'&page='+(page+1)}>Next page</Link>}</div>}</>
}
