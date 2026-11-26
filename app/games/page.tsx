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
const result=await cataloguePage(query,page,sort,platform,genre);
const href=(n:number)=>'/games?'+new URLSearchParams({q:query,platform,genre,sort,page:String(n)}).toString();
return <><section className="page-intro"><div className="eyebrow">CRITIVEX DATABASE</div><h1>Explore games.</h1><p>Search the full published catalogue.</p></section><p><Link className="text-link" href="/releases">Explore the release calendar</Link></p><form action="/games" className="filters"><label>Search<input name="q" defaultValue={query} placeholder="Game, developer or publisher"/></label><label>Platform<input name="platform" defaultValue={platform} placeholder="Exact platform name"/></label><label>Genre<input name="genre" defaultValue={genre} placeholder="Exact genre name"/></label><label>Sort<select name="sort" defaultValue={sort}><option value="new">Newest</option><option value="old">Oldest</option><option value="az">A–Z</option></select></label><button type="submit">Search</button><Link href="/games">Reset</Link></form><p>Page {page} · {result.games.length} games shown</p>{result.error?<p role="alert">{result.error}</p>:<Catalogue games={result.games}/>}<nav className="filters" aria-label="Catalogue pagination">{page>1&&<Link href={href(page-1)}>Previous page</Link>}{result.hasMore&&<Link href={href(page+1)}>Next page</Link>}</nav></>
}
