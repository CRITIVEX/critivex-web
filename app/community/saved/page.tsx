'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {browserClient} from '../../../lib/supabase';
type Saved={id:string;body:string;created_at:string};
export default function Saved(){
 const c=useMemo(browserClient,[]),[uid,U]=useState(''),[ready,T]=useState(false),[rows,R]=useState<Saved[]>([]),[error,E]=useState(''),[page,P]=useState(0),[more,H]=useState(false),[revision,V]=useState(0),[loading,L]=useState(false);
 useEffect(()=>{if(!c){T(true);return}const {data:{subscription}}=c.auth.onAuthStateChange((_e,s)=>{U(s?.user.id??'');T(true);P(0)});return()=>subscription.unsubscribe()},[c]);
 useEffect(()=>{R([]);H(false);E('');if(!c||!uid)return;let active=true;L(true);async function load(){const b=await c!.from('social_bookmarks').select('post_id').eq('user_id',uid).order('created_at',{ascending:false}).order('post_id').range(page*30,page*30+30);if(b.error)throw b.error;const ids=(b.data??[]).slice(0,30).map(x=>x.post_id);const p=ids.length?await c!.from('social_posts').select('id,body,created_at').in('id',ids):{data:[],error:null};if(p.error)throw p.error;if(active){R(ids.flatMap(id=>(p.data??[]).filter(x=>x.id===id)));H((b.data??[]).length>30)}}void load().catch(()=>{if(active)E('Unable to load saved posts.')}).finally(()=>{if(active)L(false)});return()=>{active=false}},[c,uid,page,revision]);
 async function remove(id:string){if(!c||!uid)return;const r=await c.from('social_bookmarks').delete().eq('user_id',uid).eq('post_id',id);if(r.error)E('Unable to remove bookmark.');else V(v=>v+1)}
 return <section className="panel"><Link href="/community">← Community</Link><h1>Saved posts</h1><p>Only you can see your bookmarks.</p>{!ready?<p>Checking account…</p>:!uid?<Link href="/account">Sign in</Link>:<>{error&&<p role="alert">{error}</p>}{loading?<p>Loading…</p>:rows.length?rows.map(p=><article className="panel" key={p.id}><p>{p.body}</p><Link href={'/community/post/'+p.id}>View post →</Link> <button className="secondary" onClick={()=>void remove(p.id)}>Remove</button></article>):<p>No visible saved posts on this page.</p>}<button disabled={!page||loading} onClick={()=>P(p=>p-1)}>Previous</button> <button disabled={!more||loading} onClick={()=>P(p=>p+1)}>Next</button></>}</section>
}
