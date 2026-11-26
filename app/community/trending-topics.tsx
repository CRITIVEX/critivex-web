'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {browserClient} from '../../lib/supabase';
type Topic={topic:string;posts:number;contributors:number};
export default function TrendingTopics(){
 const c=useMemo(browserClient,[]),[hours,H]=useState(168),[rows,R]=useState<Topic[]>([]),[loading,L]=useState(true),[error,E]=useState(''),[uid,U]=useState(''),[revision,V]=useState(0);
 useEffect(()=>{if(!c)return;const {data:{subscription}}=c.auth.onAuthStateChange((_e,s)=>U(s?.user.id??''));return()=>subscription.unsubscribe()},[c]);
 useEffect(()=>{R([]);L(true);E('');if(!c){L(false);E('Trending topics unavailable.');return}let active=true;void Promise.resolve(c.rpc('trending_topics_window',{hours})).then(r=>{if(!active)return;if(r.error)throw r.error;R(r.data??[])}).catch(()=>{if(active)E('Unable to load trending topics.')}).finally(()=>{if(active)L(false)});return()=>{active=false}},[c,hours,uid,revision]);
 return <section className="cvx-trending-topics"><h3>Trending topics</h3><div className="cvx-topic-periods" aria-label="Trending period">{[[24,'24h'],[168,'7d'],[720,'30d']].map(([n,label])=><button key={n} type="button" aria-pressed={hours===n} onClick={()=>H(Number(n))}>{label}</button>)}</div>{loading?<p role="status">Loading topics…</p>:error?<p role="alert">{error} <button type="button" onClick={()=>V(v=>v+1)}>Retry</button></p>:rows.length?<ol className="cvx-topic-ranking">{rows.map(r=><li key={r.topic}><Link href={'/community/topics/'+encodeURIComponent(r.topic)}>#{r.topic}</Link><small>{r.posts} {Number(r.posts)===1?'post':'posts'} · {r.contributors} players</small></li>)}</ol>:<p>No trending topics in this period.</p>}<button type="button" className="secondary" disabled={loading} onClick={()=>V(v=>v+1)}>Refresh topics</button></section>
}
