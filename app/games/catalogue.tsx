import Link from 'next/link';
import type {Game} from '../../lib/games';
export default function Catalogue({games}:{games:Game[]}){
 return <><div className="game-grid cvx-catalogue">{games.map(g=><Link className="tile game-card cvx-catalogue-card" key={g.slug} href={'/games/'+encodeURIComponent(g.slug)}>
 <div className="game-art cvx-catalogue-art" aria-hidden="true">{g.coverImageId&&/^[a-zA-Z0-9_]+$/.test(g.coverImageId)?<img src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${g.coverImageId}.jpg`} alt="" loading="lazy" decoding="async"/>:<span className="cvx-cover-placeholder">{g.title.slice(0,2).toUpperCase()}</span>}<span className="cvx-catalogue-year">{g.releaseDate.slice(0,4)||'TBA'}</span></div>
 <div className="game-copy cvx-catalogue-copy"><span className="eyebrow">{g.genres.slice(0,2).join(' / ')||'GAME'}</span><h3>{g.title}</h3><p className="cvx-catalogue-developer">{g.developer||'Developer not listed'}</p><div className="cvx-catalogue-platforms">{g.platforms.slice(0,3).map(p=><span key={p}>{p}</span>)}{g.platforms.length>3&&<span>+{g.platforms.length-3} more</span>}</div><span className="cvx-catalogue-cta">Explore game <span aria-hidden="true">→</span></span></div>
 </Link>)}</div>{!games.length&&<section className="panel"><h2>No games found</h2><p>Try another search or remove a filter.</p></section>}</>
}
