'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {browserClient} from '../../lib/supabase';
type Discussion={id:string;username:string;summary:string;likes:number;comments:number;participants:number};
export default function TrendingDiscussions(){
 const c=useMemo(browserClient,[]),[uid,U]=useState(''),[hours,H]=useState(24),[rows,R]=useState<Discussion[]>([]),[loading,L]=useState(true),[error,E]=useState(''),[revision,V]=useState(0);
 useEffect(()=>{if(!c)return;const {data:{subscription}}=c.auth.onAuthStateChange((_e,s)=>U(s?.user.id??''));return()=>subscription.unsubscribe()},[c]);
 useEffect(()=>{R([]);E('');L(true);if(!c){L(false);E('Discussions unavailable.');return}let active=true;void Promise.resolve(c.rpc('trending_discussions',{hours})).then(r=>{if(!active)return;if(r.error)throw r.error;R(r.data??[])}).catch(()=>{if(active)E('Unable to load discussions.')}).finally(()=>{if(active)L(false)});return()=>{active=false}},[c,uid,hours,revision]);
 return <section className="cvx-trending-discussions"><h3>Trending discussions</h3><div className="cvx-topic-periods">{[24,168].map(h=><button type="button" key={h} aria-pressed={hours===h} onClick={()=>H(h)}>{h===24?'24h':'7d'}</button>)}</div>{loading?<p role="status">Loading discussions…</p>:error?<p role="alert">{error}</p>:rows.length?<ol>{rows.map(r=><li key={r.id}><Link href={'/community/post/'+r.id}>{r.summary}</Link><small>@{r.username} · {r.likes} likes · {r.comments} comments · {r.participants} participants</small></li>)}</ol>:<p>No trending discussions yet.</p>}<button type="button" className="secondary" disabled={loading} onClick={()=>V(v=>v+1)}>Refresh discussions</button></section>
}
