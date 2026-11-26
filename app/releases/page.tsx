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
const page=Math.min(10000,Math.max(1,Math.floor(Number(params.page)||1))),size=48;
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
return <div className="release-calendar">
<section className="page-intro">
<span className="eyebrow">CRITIVEX RELEASE TRACKER</span>
<h1 className="!text-4xl sm:!text-6xl !leading-tight">Game release calendar</h1>
<p>Discover recent and upcoming games. Publisher schedules may change.</p>
</section>
<form className="filters"><label>Month<input type="month" name="month" defaultValue={month}/></label><label>Platform<select name="platform" defaultValue={platform}><option value="">All platforms</option>{[...new Set(['PC (Microsoft Windows)','PlayStation 5','PlayStation 4','Xbox Series X|S','Xbox One','Nintendo Switch','Nintendo Switch 2','Mac','Linux','Android','iOS','Web browser',...(platform?[platform]:[])])].map(p=><option key={p} value={p}>{p}</option>)}</select></label><button type="submit">Apply filters</button><Link className="secondary" href="/releases">Reset</Link></form>
<div className="cvx-release-month">
<Link className="secondary !px-3 !py-2" href={href(shift(-1))}>← Previous</Link>
<h2 className="!m-0 !text-xl sm:!text-3xl text-center">{new Date(month+'-01T00:00:00Z').toLocaleDateString('en-AU',{month:'long',year:'numeric',timeZone:'UTC'})}</h2>
<Link className="secondary !px-3 !py-2" href={href(shift(1))}>Next →</Link>
</div>
<div className="cvx-release-summary"><p>{failed?'Release calendar temporarily unavailable.':`Page ${page} · ${filtered.length} releases`}</p><Link href={href(now.slice(0,7))}>Current month →</Link></div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
{filtered.map(g=>{const days=Math.round((Date.parse(g.releaseDate)-Date.parse(now))/86400000);return <Link className="tile cvx-release-card !p-0 min-w-0 flex flex-col overflow-hidden" key={g.slug} href={'/games/'+encodeURIComponent(g.slug)}>
<div className="h-48 bg-zinc-950 flex items-center justify-center overflow-hidden">{g.coverImageId&&/^[a-zA-Z0-9_]+$/.test(g.coverImageId)?<img src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${g.coverImageId}.jpg`} alt="" loading="lazy" className="block h-full w-full object-contain"/>:<span className="text-4xl font-bold text-violet-300">{g.title.slice(0,2).toUpperCase()}</span>}</div>
<div className="p-4 flex flex-col gap-3 flex-1 min-w-0">
<div className="flex flex-wrap items-center gap-2 text-xs"><span className="text-zinc-300">{g.releaseDate}</span><span className={"cvx-release-status "+(days>0?"is-upcoming":days===0?"is-today":"is-released")}>{days>0?`In ${days} days`:days===0?'Releases today':'Released'}</span></div>
<h3 className="!m-0 !text-lg !leading-snug [overflow-wrap:anywhere]">{g.title}</h3>
<div className="flex flex-wrap gap-1.5 mt-auto">{g.platforms.map(p=><span key={p} className="max-w-full rounded border border-zinc-700 px-2 py-1 text-xs text-zinc-300 [overflow-wrap:anywhere]">{p}</span>)}</div>
</div></Link>})}
</div>
{!failed&&!filtered.length&&<div className="panel"><h3>No releases found</h3><p>Try another month or platform.</p></div>}
{!failed&&(page>1||more)&&<div className="flex flex-wrap items-center justify-between gap-3 mt-8">{page>1&&<Link className="secondary" href={href(month)+'&page='+(page-1)}>← Previous page</Link>}{more&&<Link className="secondary ml-auto" href={href(month)+'&page='+(page+1)}>Next page →</Link>}</div>}
</div>
}
