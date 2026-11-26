export const dynamic='force-dynamic';
import Link from 'next/link';
import type {Metadata} from 'next';
import {cataloguePage} from '../../lib/public-content';
import Catalogue from './catalogue';
export const metadata:Metadata={title:'Games',description:'Browse the Critivex game catalogue.'};
export default async function Games({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
const params=await searchParams;const val=(k:string)=>typeof params[k]==='string'?(params[k] as string).slice(0,150):'';
const query=val('q'),platform=val('platform'),genre=val('genre'),sort=['new','old','az','recent'].includes(val('sort'))?val('sort'):'az';
const page=Math.max(1,Math.min(100000,Math.floor(Number(val('page'))||1)));
const anchor=val('cursor'),backwards=!!anchor&&val('direction')==='prev';
const result=await cataloguePage(query,page,sort,platform,genre,anchor,backwards);
const href=(n:number,cursor:string,direction:string)=>'/games?'+new URLSearchParams({q:query,platform,genre,sort,page:String(n),cursor,direction}).toString();
return <div className="cvx-games-discovery"><section className="page-intro"><div className="eyebrow">CRITIVEX DATABASE</div><h1>Explore games.</h1><p>Search the full published catalogue.</p></section><nav className="cvx-game-discovery-nav" aria-label="Game discovery"><Link href="/games" aria-current="page">All games</Link><Link href="/games?sort=new">Newest releases</Link><Link href="/rankings">Top rated</Link><Link href="/trending">Trending</Link><Link href="/releases">Release calendar</Link></nav><form action="/games" className="filters"><label>Search<input name="q" defaultValue={query} placeholder="Game title"/></label><label>Platform<input name="platform" defaultValue={platform} placeholder="Exact platform name"/></label><label>Genre<input name="genre" defaultValue={genre} placeholder="Exact genre name"/></label><label>Sort<select name="sort" defaultValue={sort}><option value="new">Newest</option><option value="old">Oldest</option><option value="az">A–Z</option></select></label><button type="submit">Search</button><Link href="/games">Reset</Link></form><div className="cvx-catalogue-toolbar"><div><h2>{query?`Results for “${query}”`:"Game catalogue"}</h2><p>Page {page} · {result.games.length} games shown</p></div><span>{sort==="new"?"Newest first":sort==="old"?"Oldest first":"Alphabetical"}</span></div>{result.error?<p role="alert">{result.error}</p>:<Catalogue games={result.games}/>}<nav className="cvx-catalogue-pagination" aria-label="Catalogue pagination">{!result.error&&(result.hasPrevious??page>1)&&result.games.length>0&&<Link href={href(Math.max(1,page-1),result.games[0].slug,'prev')}>Previous page</Link>}{!result.error&&result.hasMore&&result.games.length>0&&<Link href={href(page+1,result.games[result.games.length-1].slug,'next')}>Next page</Link>}</nav></div>
}
