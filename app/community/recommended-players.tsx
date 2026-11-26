'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {browserClient} from '../../lib/supabase';
type Player={user_id:string;username:string;display_name:string|null;avatar_url:string|null;shared_games:number;mutual_connections:number};
function safe(url:string|null){try{return url&&new URL(url).protocol==='https:'?url:null}catch{return null}}
export default function RecommendedPlayers(){
 const c=useMemo(browserClient,[]),[uid,U]=useState(''),[rows,R]=useState<Player[]>([]),[busy,B]=useState(''),[error,E]=useState(''),[revision,V]=useState(0);
 useEffect(()=>{if(!c)return;const {data:{subscription}}=c.auth.onAuthStateChange((_e,s)=>U(s?.user.id??''));return()=>subscription.unsubscribe()},[c]);
 useEffect(()=>{R([]);E('');if(!c||!uid)return;let active=true;void Promise.resolve(c.rpc('recommended_players')).then(r=>{if(!active)return;if(r.error)E('Recommendations unavailable.');else R(r.data??[])}).catch(()=>{if(active)E('Recommendations unavailable.')});return()=>{active=false}},[c,uid,revision]);
 async function follow(id:string){if(!c||!uid||busy)return;B(id);E('');try{const r=await c.from('social_follows').insert({following_id:id});if(r.error)throw r.error;R(old=>old.filter(p=>p.user_id!==id));V(v=>v+1)}catch{E('Unable to follow this player.')}finally{B('')}}
 if(!uid)return null;
 return <section className="cvx-recommended"><h3>Who to follow</h3>{rows.map(p=><div className="cvx-recommended-row" key={p.user_id}><Link className="cvx-social-avatar" href={'/players/'+encodeURIComponent(p.username)} aria-label={p.display_name||p.username}>{safe(p.avatar_url)?<img src={safe(p.avatar_url)!} alt="" referrerPolicy="no-referrer"/>:(p.display_name||p.username)[0].toUpperCase()}</Link><div><Link href={'/players/'+encodeURIComponent(p.username)}>{p.display_name||p.username}</Link><small>{p.shared_games>0?p.shared_games+' shared favourite games':p.mutual_connections>0?p.mutual_connections+' shared connections':'Suggested player'}</small></div><button type="button" className="secondary" disabled={!!busy} onClick={()=>void follow(p.user_id)}>Follow</button></div>)}{error&&<p role="alert">{error}</p>}<Link href="/community/players">Discover more players →</Link></section>
}
