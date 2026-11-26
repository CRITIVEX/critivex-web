import {createClient} from '@supabase/supabase-js';
import {notFound} from 'next/navigation';
import Link from 'next/link';
export const dynamic='force-dynamic';
export const metadata={title:'Game collection',robots:{index:false,follow:false}};
export default async function Collection({params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))notFound();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)return <p>Collection unavailable.</p>;
 const c=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}});
 const r=await c.from('game_collections').select('name,description,cover_url').eq('id',id).eq('is_public',true).maybeSingle();if(r.error)return <p>Collection temporarily unavailable.</p>;if(!r.data)notFound();
 const items=await c.from('game_collection_items').select('game_id,games(slug,title,cover_image_id)').eq('collection_id',id).order('added_at',{ascending:false}).limit(200);
 return <><section className="page-intro">{r.data.cover_url?.startsWith('https://')&&<img className="cvx-collection-cover" src={r.data.cover_url} alt="" referrerPolicy="no-referrer"/>}<span className="eyebrow">COMMUNITY COLLECTION</span><h1>{r.data.name}</h1><p>{r.data.description}</p></section><div className="game-grid">{items.data?.map(i=>{const g=Array.isArray(i.games)?i.games[0]:i.games;return g&&<Link className="tile" key={i.game_id} href={'/games/'+encodeURIComponent(g.slug)}>{g.cover_image_id&&/^[a-zA-Z0-9_]+$/.test(g.cover_image_id)&&<img className="cvx-collection-game-art" src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${g.cover_image_id}.jpg`} alt="" loading="lazy"/>}<h3>{g.title}</h3></Link>})}</div>{items.error?<p>Games temporarily unavailable.</p>:<p>Showing up to 200 games.</p>}</>
}
