export const dynamic='force-dynamic';
import {notFound} from 'next/navigation';
import Link from 'next/link';
import {liveReviews,liveGame} from '../../../lib/public-content';
import {verdict} from '../../../lib/scoring.mjs';
import ScoreCard from '../../games/[slug]/score-card';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props){const {slug}=await params;const r=(await liveReviews()).find(r=>r.slug===slug);return {title:r?.title??'Review not found',description:r?.summary}}
export default async function Review({params}:Props){
 const {slug}=await params;const r=(await liveReviews()).find(r=>r.slug===slug);if(!r)notFound();
 const g=await liveGame(r.gameSlug).catch(()=>null);
 const art=g?.screenshotImageIds?.find(id=>/^[a-zA-Z0-9_]+$/.test(id));
 return <article className="cvx-review"><Link className="text-link" href="/reviews">← All reviews</Link>
 <header className="cvx-review-hero">{art&&<img className="cvx-review-backdrop" src={`https://images.igdb.com/igdb/image/upload/t_1080p/${art}.jpg`} alt=""/>}<div className="cvx-review-heading"><span className="eyebrow">CRITIVEX · EDITORIAL REVIEW</span><h1>{r.title}</h1><p>{r.summary}</p><div className="cvx-review-byline"><strong>{r.author}</strong><time dateTime={r.publishedAt}>{r.publishedAt.slice(0,10)}</time>{r.platform&&<span>Tested on {r.platform}</span>}</div><Link className="text-link" href={'/games/'+encodeURIComponent(r.gameSlug)}>Game information →</Link></div></header>
 <div className="cvx-review-layout section"><section className="panel cvx-review-body" aria-label="Review article">{r.body.map((p,i)=><p key={i}>{p}</p>)}</section><aside className="panel cvx-review-verdict"><span className="eyebrow">THE VERDICT</span><h2>{verdict(r.score)}</h2><ScoreCard label="Critivex Score" score={r.score} detail="Editorial review"/>{r.pros.length>0&&<section className="cvx-review-pros"><h3>What works</h3><ul>{r.pros.map((p,i)=><li key={i}>{p}</li>)}</ul></section>}{r.cons.length>0&&<section className="cvx-review-cons"><h3>What doesn't</h3><ul>{r.cons.map((p,i)=><li key={i}>{p}</li>)}</ul></section>}<section className="cvx-review-disclosure"><h3>Disclosure</h3><p>{r.disclosure||'No disclosure provided.'}</p><Link className="text-link" href="/scores">Scoring methodology →</Link></section></aside></div></article>
}
